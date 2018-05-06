var hint = "Try typing \"help\" to see all available commands"
var help = "\
help      Display this message<br>\
clear     Clear the terminal screen &lt;Ctrl&gt;+&lt;L&gt;<br>\
back      Go to the last page in history<br>\
forward   Go to the next page in history<br>\
ls        List directory contents<br>\
cd        Change the working directory<br>\
";
var dir_head = "<br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">.</span><br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">..</span>\
";
var directory = "drwx--x--x  2 chris chris 4.0K Jan  1 00:07 <span class=\"dir\">";
var symlink =   "lrwxrwxrwx  1 chris chris    4 May  4 12:33 <span class=\"symlink\">";
var pages = ["index", "about", "projects"];
var completions = ["help", "clear", "back", "forward",
    "ls", "ls links/", "ls ./links/", "ls ~/links/",
    "cd", "cd links/", "cd ./links/", "cd ~/links/"
];

var command_history = [];
var history_offset = 0;

var current_dir = "~/";

var stdout = document.getElementById("stdout")
var input = document.getElementById("terminal-input");

// Show helpful hint as default message (instead of no JS warning)
stdout.innerHTML = hint;

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
        case "cd":
            cd(command, true);
            break;
        default:
            command_history.splice(0, 1);
            stdout.innerHTML =
                "\"" + command.join(" ") + "\" is not a valid command<br>" + hint;
  }

  return false;
}

function cd(command, current_tab) {
    // Only parse directory if command contains one
    var dir = "~/";
    if (command.length > 1) {
        dir = parse_dir(command[1]);
    }

    // Change to root when running just "cd"
    if (dir === "~/") {
        set_current_dir("~/");
        return;
    }

    // Change to links when runnig "cd ~/links"
    if (dir === "~/links")
    {
        set_current_dir("~/links/");
        return;
    }

    // Open an external link
    if (dir.startsWith("~/links/"))
    {
        // Get the specified dir name
        var dir_name = dir.substring("~/links/".length);

        // Read the link for the name
        var links = document.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
            var title = links[i].getElementsByClassName("link-title");
            if (title.length == 1 && title[0].innerHTML === dir_name) {
                open_link(links[i].href, current_tab);
                return;
            }
        }
    }
    // Open an internal link
    else {
        // Remove "~/" at the beginning
        var dir_name = dir.substring("~/".length);

        // Open page
        for (var i = 0; i < pages.length; i++) {
            if (pages[i] === dir_name) {
                open_link(pages[i], current_tab);
                return;
            }
        }
    }

    // Could not be found
    stdout.innerHTML =
        command[0] + ": no such file or directory: " + dir;
}

// Update the working directory in the command line
function set_current_dir(dir) {
    var elem = document.getElementsByClassName("terminal-form");
    if (elem.length !== 0) {
        elem[0].firstChild.data = dir.substring(dir.length - 1) + "&nbsp;$";
    }
    current_dir = dir;
}

// Open a link
function open_link(url, current_tab) {
    if (current_tab) {
        window.location = url;
    } else {
        window.open(url, '_blank');
    }
}

// List directory contents
function ls(command) {
    // Only parse directory if command contains one
    var dir = "~/";
    if (command.length > 1) {
        dir = parse_dir(command[1]);
    }

    // List current directory
    if (dir === "~/")
    {
        var text = "total 12K";
        text += dir_head;
        for(var i = 0; i < pages.length; i++) {
            text += "<br>" + directory + pages[i] + "</span>";
        }
        text += "<br>drwxr-xr-x  2 chris chris 4.0K May  5 15:42 " +
            "<span class=\"dir\">links</span>";
        stdout.innerHTML = replace_whitespace(text);
    }
    // List link directory
    else if (dir === "~/links")
    {
        var links = document.getElementsByTagName("a");
        var text = "total 8K";
        text += dir_head;
        for (var i = 0; i < links.length; i++) {
            var title = links[i].getElementsByClassName("link-title");
            if (title.length == 1) {
                text += "<br>" + symlink + title[0].innerHTML +
                    "</span>" + " -> " + links[i].href;
            }
        }
        stdout.innerHTML = replace_whitespace(text);
    }
    // No directory found
    else {
        stdout.innerHTML =
            "ls: cannot access '" + dir + "': No such file or directory";
    }
}

// Return the canonical version of a directory
// This is either "~/directory" for pages or "~/links/directory" for links
function parse_dir(directory) {
    // Setup the base directory to the current working directory
    var target_dir = current_dir.substring(2);

    // Remove "~/" from the beginning because it's only allowed there
    if (directory.startsWith("~/")) {
        directory.substring(2);
        target_dir = "";
    }

    var elements = directory.split("/");
    for (var i = 0; i < elements.length; i++) {
        if (elements[i] == ".") {
            continue;
        }

        // Go to previous dir
        if (elements[i] == "..") {
            var tmp = target_dir.split("/");
            tmp.pop(1);
            if (tmp.length !== 0) {
                target_dir = tmp.join("/") + "/";
            } else {
                target_dir = "";
            }
        }
        // Append normal directory to path
        else {
            target_dir += elements[i] + "/";
        }
    }

    // Remove trailing "/"
    if (target_dir.endsWith("/")) {
        target_dir = target_dir.substring(0, target_dir.length - 1);
    }

    return "~/" + target_dir;
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

// Add completions for links and pages
function add_completions() {
    // Add completions for links
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        var title = links[i].getElementsByClassName("link-title");
        if (title.length === 1) {
            completions.push("open links/"     + title[0].innerHTML);
            completions.push("open ./links/"   + title[0].innerHTML);
            completions.push("source links/"   + title[0].innerHTML);
            completions.push("source ./links/" + title[0].innerHTML);
        }
    }

    // Add completions for pages
    for (var i = 0; i < pages.length; i++) {
        completions.push("open " + pages[i]);
        completions.push("source " + pages[i]);
        completions.push("open ./" + pages[i]);
        completions.push("source ./" + pages[i]);
    }
}
add_completions();

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
}
