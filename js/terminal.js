var hint = "Try typing \"help\" to see all available commands"
var help = "\
pages     Show all available pages<br>\
help      Display this message<br>\
clear     Clear the terminal [ctrl+l]<br>\
back      Go to the last page<br>\
forward   Go to the next page\
";
var pages = "\
index     Back to the start<br>\
about     Find out who I am and how to contact me<br>";
// TODO: projects  Look at which projects I am working on<br>\
var stdout = document.getElementById("stdout")

// Check the last command and update stdout appropriately
function submit_command() {
  var command = document.getElementById('terminal-input').value.toLowerCase();
  document.getElementById("terminal-input").value = "";

  switch (command) {
    case "help":
      stdout.innerHTML = replace_whitespace(help);
      break;
    case "pages":
      stdout.innerHTML = replace_whitespace(pages);
      break;
    case "clear":
      stdout.innerHTML = "";
      break;
    case "about":
      window.location = "/about";
      break;
    case "projects":
      window.location = "/projects";
      break;
    case "index":
      window.location = "/";
      break;
    case "back":
      window.history.back();
      break;
    case "forward":
      window.history.forward();
      break;
    default:
      stdout.innerHTML = "\"" + command + "\" is not a valid command<br>" + hint;
  }

  return false;
}

// Replace whitespace with "&nbsp;" to prevent shortening
function replace_whitespace(input) {
  return input.replace(/ /g, "&nbsp;");
}

// Force focus on the terminal
document.getElementById('terminal-input').onblur = function(e) {
  var terminal_input = this;
  setTimeout(function() {
    terminal_input.focus()
  }, 10);
}
document.getElementById('terminal-input').focus();

// Register Ctrl+L shortcut to clear terminal
function clear_console(e) {
  if (e.keyCode == 76 && e.ctrlKey) {
    e.preventDefault();
    stdout.innerHTML = "";
  }
}
document.addEventListener('keydown', clear_console, true);

// Set input to hopefully helpful hint
// If this is a 404 page, set it to error message
function ends_with(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

if (ends_with(document.location.toString(), "404")) {
  stdout.innerHTML = "Command returned with exit code 404";
} else {
  stdout.innerHTML = hint;
}
