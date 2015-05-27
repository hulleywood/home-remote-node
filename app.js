var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sys = require('sys')
var exec = require('child_process').exec;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* GET monitor. */
app.get('/monitor', function(req, res, next) {
  res.sendStatus(200);
});

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { });
});

// define GET request for /send/deviceName/buttonName
app.get('/send/system/off', function(req, res) {

  var command = "irsend SEND_ONCE projector KEY_POWER";
  exec(command, function(error, stdout, stderr){
    if(error)
      res.send("Error sending command");
    else   
      var command = "irsend SEND_ONCE projector KEY_POWER";
      exec(command, function(error, stdout, stderr){
        if(error)
          res.send("Error sending command");
        else   
          res.send("Command sent successfully");
      });
  });

});

// define GET request for /send/deviceName/buttonName
app.get('/send/:device/:key', function(req, res) {

  var deviceName = req.params["device"];
  var key = req.params["key"].toUpperCase();

  // Make sure that the user has requested a valid device 
  if(!devices.hasOwnProperty(deviceName)) {
    res.send("invalid device");
    return;
  }

  // Make sure that the user has requested a valid key/button
  var device = devices[deviceName];
  var deviceKeyFound = false;
  for(var i = 0; i < device.length; i++) {
    if(device[i] === key) {
      deviceKeyFound = true; 
      break;
    }
  }
  if(!deviceKeyFound) {
    res.send("invalid key number: "+key);
    return;
  }

  // send command to irsend
  var command = "irsend SEND_ONCE "+deviceName+" "+key;
  exec(command, function(error, stdout, stderr){
    if(error)
      res.send("Error sending command");
    else   
      res.send("Successfully sent command");
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Dictionary of devices and their buttons
 * @type {Object}
 */
var devices = {};
/**
 * Generates function to get devices' buttons from irsend command
 * @param  {String} deviceName name of device
 * @return {Function}            exec callback
 */ 
var getCommandsForDevice = function(deviceName) {
  /**
   * Get Device's Button from irsend command
   * @param  {String} error  Error from running command
   * @param  {String} stdout std out
   * @param  {String} stderr std err
   * @return {None}        
   */
  return function(error, stdout, stderr) {
    var lines = stderr.split("\n");
    for(var lineIndex in lines) {
      var line = lines[lineIndex];
      var parts = line.split(" ");
      if(parts.length>2) {
        var keyName = parts[2];
        devices[deviceName].push(keyName);
        console.log(deviceName + " found key: "+keyName);
      }
    }
  }
};

/**
 * Get Device from irsend command
 * @param  {String} error  Error from running command
 * @param  {String} stdout std out
 * @param  {String} stderr std err
 * @return {None}        
 */
var getDevice = function (error, stdout, stderr) {
  if(error) {
    console.log("irsend not available.");
    return;
  }
  var lines = stderr.split("\n");
  for(var lineIndex in lines) {
    var line = lines[lineIndex];
    var parts = line.split(" ");
    if(parts.length>1) {
      var deviceName = parts[1];
      console.log("device found: "+deviceName.trim());
      devices[deviceName] = [];
      exec("irsend list \""+deviceName+"\" \"\"", getCommandsForDevice(deviceName));

    }
  }          
};
// Get all device information
exec("irsend list \"\" \"\"", getDevice);

module.exports = app;
