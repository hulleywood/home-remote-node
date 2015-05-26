$(function(){
  $('.remote-action').click(function(e){
    this.blur();
    var $btn = $(e.currentTarget),
        device = $btn.data('device'),
        command = $btn.data('command');

    if (device && command) {
      $("#div1").html('');
      $.ajax({url: "send/" + device +"/" + command, success: function(result){
        console.log('sent');
      }});
    }
  });
});
