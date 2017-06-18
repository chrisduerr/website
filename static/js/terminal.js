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
about     Who I am and how to contact me<br>\
projects  The projects I'm currently working on<br>\
 <br>\
type [page] to navigate";

var stdout = document.getElementById("stdout")
var input = document.getElementById("terminal-input");

var commands = ["help", "pages", "clear", "about", "projects", "index",
    "back", "forward", "ls", "cat shadow", "cat .htaccess", "rm -rf /",
    "rm -rf / --no-preserve-root", "cd .."
];

// Check the last command and update stdout appropriately
function submit_command() {
  var command = input.value.toLowerCase();
  input.value = "";

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
    case "cd ..":
    case "back":
      window.history.back();
      break;
    case "forward":
      window.history.forward();
      break;
    case "ls":
      stdout.innerHTML = ".htaccess shadow";
      break;
    case "cat .htaccess":
      stdout.innerHTML = "Allow From All";
      break;
    case "cat shadow":
      stdout.innerHTML = "root:password1234:17317:0:99999:7:::";
      break;
    case "rm -rf / --no-preserve-root":
      stdout.innerHTML = "Deleting christianduerr.com…";
      break;
    case "rm -rf /":
      stdout.innerHTML = "\
        it is dangerous to operate recursively on '/'<br>\
        use --no-preserve-root to override this failsafe";
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
input.onblur = function(e) {
  var terminal_input = this;
  setTimeout(function() {
    terminal_input.focus()
  }, 10);
}
input.focus();

// Register Ctrl+L shortcut to clear terminal
// Register Tab shortcut for completion
function keydown(e) {
  if (e.keyCode == 76 && e.ctrlKey) {
    e.preventDefault();
    stdout.innerHTML = "";
  } else if (e.keyCode == 9) {
    e.preventDefault();
    var current = input.value;
    if (current.length == 0) {
      return;
    }

    for(var i = 0; i < commands.length; i++) {
      if (commands[i].startsWith(current)) {
        input.value = commands[i];
        return;
      }
    }
  }
}
document.addEventListener('keydown', keydown, true);

// Set input to hopefully helpful hint
// If this is a 404 page, set it to error message
function ends_with(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var errorcode = document.getElementById("errorcode").innerHTML;
if (errorcode != "") {
  stdout.innerHTML = "Command returned with exit code " + errorcode;
} else {
  stdout.innerHTML = hint;
}
