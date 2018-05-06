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
var pages = ["~/about", "~/projects"];
var completions = ["help", "clear", "back", "forward",
    "ls", "ls ~/", "ls ./", "cd", "cd ./", "cd ~/"
];

var command_history = [""];
var history_offset = 0;

var working_dir = "~";

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
    command_history.push(input.value);
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
            command_history.pop();
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
        open_link("index", current_tab);
        return;
    }

    // Open an internal page
    for (var i = 0; i < pages.length; i++) {
        if (pages[i] === dir) {
            // Trim "~/" before opening "~/projects"|"~/about"
            open_link(pages[i].substring(2), current_tab);
            return;
        }
    }

    // Open an external symlink
    var symlink = dir.substring((working_dir + "/").length);
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        var title = links[i].getElementsByClassName("link-title");
        if (title.length >= 1 && title[0].innerHTML === symlink) {
            open_link(links[i].href, current_tab);
            return;
        }
    }

    // Could not be found
    stdout.innerHTML =
        command[0] + ": no such file or directory: " + dir;
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
    if (command.length == 1) {
        command.push("./");
    }
    var dir = parse_dir(command[1]);

    // List available pages in index
    if (dir === "~/") {
        var text = "total 12K";
        text += dir_head;
        for(var i = 0; i < pages.length; i++) {
            text += "<br>" + directory + pages[i].substring(2) + "</span>";
        }
        stdout.innerHTML = replace_whitespace(text);
        return;
    }

    // Show links when in a subdirectory and `dir` is working directory
    if (dir == working_dir && pages.includes(dir)) {
        var text = "total 8K";
        text += dir_head;
        var links = document.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
            var title = links[i].getElementsByClassName("link-title");
            if (title.length == 1) {
                text += "<br>" + symlink + title[0].innerHTML +
                    "</span>" + " -> " + links[i].href;
            }
        }
        stdout.innerHTML = replace_whitespace(text);
        return;
    }

    // Don't show anything for a page when it's not open
    if (pages.includes(dir)) {
        var text = "total 8K";
        text += dir_head;
        stdout.innerHTML = replace_whitespace(text);
        return;
    }

    // Show symlink targets
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        var title = links[i].getElementsByClassName("link-title");
        if (title.length == 1) {
            var symlink_target = parse_dir("./" + title[0].innerHTML);
            if (dir == symlink_target) {
                stdout.innerHTML = symlink + title[0].innerHTML +
                    "</span>" + " -> " + links[i].href;
                return;
            }
        }
    }

    // No directory found
    stdout.innerHTML =
        "ls: cannot access '" + dir + "': No such file or directory";
}

// Return the canonical version of a directory
function parse_dir(directory) {
    // Setup the base directory to the current working directory
    var target_dir = working_dir.substring(2);
    if (target_dir !== "") {
        target_dir += "/";
    }

    // Remove "~/" from the beginning because it's only allowed there
    if (directory.startsWith("~/")) {
        directory = directory.substring(2);
        target_dir = "";
    } else if (directory === "~") {
        target_dir = "";
        directory = "";
    }

    var elements = directory.split("/");
    for (var i = 0; i < elements.length; i++) {
        if (elements[i] == "." || elements[i] == "") {
            continue;
        }

        // Go to previous dir
        if (elements[i] == "..") {
            var tmp = target_dir.split("/");
            tmp = tmp.splice(0, tmp.length - 2);
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
            completions.push("cd "   + title[0].innerHTML);
            completions.push("cd ./" + title[0].innerHTML);
        }
    }

    // Add completions for pages
    for (var i = 0; i < pages.length; i++) {
        completions.push("cd "   + pages[i]);
        completions.push("ls "   + pages[i]);
        if (working_dir == "~") {
            completions.push("cd "   + pages[i].substring(2));
            completions.push("cd ./" + pages[i].substring(2));
            completions.push("ls "   + pages[i].substring(2));
            completions.push("ls ./" + pages[i].substring(2));
        }
    }
}
add_completions();

// Set the working directory to the current page
function set_working_dir() {
    var loc = document.location.href;
    var index = loc.lastIndexOf("/");
    if (index !== -1) {
        var page = "~/" + loc.substring(index + "/".length);

        var elem = document.getElementById("ps1");
        if (elem !== null) {
            if (pages.includes(page)) {
                elem.innerHTML = page + " $";
                working_dir = page;
            } else {
                elem.innerHTML = "~ $";
            }
        }
    }
}
set_working_dir();

// Show error messages if present
function update_stderr() {
    var get_params = new URL(window.location.href).searchParams;
    var errorcode = get_params.get("error");
    if (errorcode !== null) {
        // Show error code if it's present as a GET parameter
        stdout.innerHTML = "Command returned with exit code " + errorcode;
    }
}
update_stderr();

// Force focus on the terminal
input.onblur = function(e) {
  var terminal_input = this;
  setTimeout(function() {
    terminal_input.focus()
  }, 10);
}
input.focus();
