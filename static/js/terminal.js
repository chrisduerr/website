var hint = "Try typing \"help\" to see all available commands"
var help = "\
help      Display this message<br>\
clear     Clear the terminal [ctrl+l]<br>\
back      Go to the last page in history<br>\
forward   Go to the next page in history<br>\
ls        List the contents of a directory<br>\
cat       Display the contentn of a file<br>\
source    Open a file in the current tab<br>\
open      Open a file in a new tab<br>\
";
var dir_head = "<br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">.</span><br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">..</span>\
";
var page_file = "-rwx--x--x  1 chris chris    0 Jan  1 00:07 <span class=\"file\">";
var link_file = "-rwxr-xr-x  1 chris chris   23 Jan  1 00:07 <span class=\"file\">";
var pages = ["index", "about", "projects"];
var completions = ["help", "clear", "back", "forward",
               "cat links/",    "cat ./links/",
    "ls",      "ls links/",     "ls ./links/",
    "open",    "open links/",   "open ./links/",
    "source",  "source links/", "source ./links/"
];

var command_history = [];
var history_offset = 0;

var stdout = document.getElementById("stdout")
var input = document.getElementById("terminal-input");

// Check the last command and update stdout appropriately
function submit_command() {
    if (input.value === null || input.value === "") {
        return;
    }

    // Update state
    var command = input.value.toLowerCase().split(" ");
    command_history.splice(0, 0, command);
    history_offset = 0;
    input.value = "";

    // Run command
    switch (command[0]) {
        case "help":
            stdout.innerHTML = replace_whitespace(help);
            break;
        case "clear":
            stdout.innerHTML = "";
            break;
        case "back":
            window.history.back();
            break;
        case "forward":
            window.history.forward();
            break;
        case "ls":
            ls(command);
            break;
        case "cat":
            cat(command);
            break;
        case "source":
            open(command, true);
            break;
        case "open":
            open(command, false);
            break;
        default:
            command_history.splice(0, 1);
            stdout.innerHTML =
                "\"" + command + "\" is not a valid command<br>" + hint;
  }

  return false;
}

function open(command, current_tab) {
    if (command.length == 1 || command[1] == "") {
        stdout.innerHTML = command[0] + ": No file or directory specified";
        return;
    }

    // Open an external link
    if (command[1].startsWith("./links/") || command[1].startsWith("links/")) {
        var file_name =
            command[1].substring(command[1].indexOf("links/") + "links/".length);

        var links = document.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
            var title = links[i].getElementsByClassName("link-title")[0].innerHTML;
            if (title === file_name) {
                open_link(links[i].href, current_tab);
                return;
            }
        }
    }
    // Open an internal link
    else {
        for (var i = 0; i < pages.length; i++) {
            if (pages[i] === command[1]) {
                open_link(pages[i], current_tab);
                return;
            }
        }
    }

    // Could not be found
    stdout.innerHTML =
        command[0] + ": " + command[1] + ": No such file or directory";
}

// Open a link
function open_link(url, current_tab) {
    if (current_tab) {
        window.location = url;
    } else {
        window.open(url, '_blank');
    }
}

// Echo contents of a link
function cat(command) {
    if (command.length == 1 || command[1] == "" ||
        (!command[1].startsWith("./links/") && !command[1].startsWith("links/")))
    {
        if (command.length == 1 || command[1] == "") {
            stdout.innerHTML = "cat: No file or directory specified";
        } else {
            for (var i = 0; i < pages.length; i++) {
                if (pages[i] == command[1]) {
                    stdout.innerHTML = "cat: " + command[1] + ": Permission denied";
                    return;
                }
            }
            stdout.innerHTML = "cat: " + command[1] + ": No such file or directory";
        }
        return;
    }

    // Get the file which shall be catted
    var file_name =
        command[1].substring(command[1].indexOf("links/") + "links/".length);

    // Try catting the file by looking through the links
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        var title = links[i].getElementsByClassName("link-title")[0].innerHTML;
        if (title === file_name) {
            stdout.innerHTML = links[i].href;
            return;
        }
    }

    // File doesn't exist
    stdout.innerHTML =
        "cat: " + command[1] + ": No such file or directory";
}

// List directory contents
function ls(command) {
    // List current directory
    if (command.length == 1 || command[1] == ""
        || command[1] == "." || command[1] == "..")
    {
        var text = "total 12K";
        text += dir_head;
        for(var i = 0; i < pages.length; i++) {
            text += "<br>" + page_file + pages[i] + "</span>";
        }
        text += "<br>drwxr-xr-x  2 chris chris 4.0K May  5 15:42 " +
            "<span class=\"dir\">links</span>";
        stdout.innerHTML = replace_whitespace(text);
    }
    // List link directory
    else if (command[1] == "./links" || command[1] == "./links/"
        || command[1] == "links" || command[1] == "links/")
    {
        var links = document.getElementsByTagName("a");
        var text = "total 8K";
        text += dir_head;
        for (var i = 0; i < links.length; i++) {
            var title = links[i].getElementsByClassName("link-title")[0].innerHTML;
            if (title !== undefined) {
                text += "<br>" + link_file + title + "</span>";
            }
        }
        stdout.innerHTML = replace_whitespace(text);
    }
    // No directory found
    else {
        stdout.innerHTML =
            "ls: cannot access '" + command[1] + "': No such file or directory";
    }
}

// Replace whitespace with "&nbsp;" to prevent shortening
function replace_whitespace(input) {
  return input.replace(/  /g, "&nbsp;&nbsp;");
}

// Event handler for keyboard shortcuts
function keydown(e) {
    // <Ctrl>+<L> to clear terminal
    if (e.keyCode == 76 && e.ctrlKey) {
        e.preventDefault();
        stdout.innerHTML = "";
    }
    // <Tab> for completion
    else if (e.keyCode == 9) {
        e.preventDefault();
        var current = input.value;
        if (current.length == 0) {
            return;
        }

        for(var i = 0; i < completions.length; i++) {
            if (completions[i].startsWith(current)) {
                input.value = completions[i];
                return;
            }
        }
    }
    // <Up> for previous command
    else if (e.keyCode == 38) {
        if (history_offset >= (command_history.length - 1)) {
            return;
        }
        history_offset++;

        var hist_command = command_history[history_offset];
        if (hist_command !== undefined) {
            input.value = hist_command;
        }
    }
    // <Down> for next command
    else if (e.keyCode == 40) {
        if (history_offset <= 0) {
            return;
        }
        history_offset--;

        var hist_command = command_history[history_offset];
        if (hist_command !== undefined) {
            input.value = hist_command;
        }
    }
}
document.addEventListener('keydown', keydown, true);

// Force focus on the terminal
input.onblur = function(e) {
  var terminal_input = this;
  setTimeout(function() {
    terminal_input.focus()
  }, 10);
}
input.focus();

// Setup the message that will show up in the terminal by default
var get_params = new URL(window.location.href).searchParams;
var command = get_params.get("command");
var errorcode = get_params.get("error");
if (errorcode !== null) {
    // Show error code if it's present as a GET parameter
    stdout.innerHTML = "Command returned with exit code " + errorcode;
} else if (command !== null && command !== undefined) {
    // Run the specified command
    submit_command(command);
} else {
    // Show helpful hint if there is no error
    stdout.innerHTML = hint;
}
