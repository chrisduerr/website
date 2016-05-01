function set_cookie(cname, cvalue, exdays) {
	var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function open_popup() {
	set_cookie("has_seen_cookie_notifier", "true", 365);
	  $('#cookie-modal').openModal();
}

function check_for_popup() {
	var cookie_name = "has_seen_cookie_notifier=";
	var my_cookie = document.cookie.indexOf(cookie_name);
	if (my_cookie == -1)
		open_popup();
}

var $text = $('#intro-content');
$text.css({ height: 'auto' });
var height = $text.css('height');
$text.css({ height: '' });

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '#intro-content.show { height: ' + height + ' }';
document.getElementsByTagName('head')[0].appendChild(style);

document.getElementById("intro-img").onclick=function() {
  $("#intro-img").toggleClass('show');
  $("#intro-content").toggleClass('show');
};

$(document).ready(function() {
    check_for_popup();
});
