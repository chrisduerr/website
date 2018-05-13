var hint = "Try typing \"help\" to see all available commands"
var help = "\
help       Display this message<br>\
clear      Clear the terminal screen &lt;Ctrl&gt;+&lt;L&gt;<br>\
back       Go to the last page in history<br>\
forward    Go to the next page in history<br>\
exit       Close the current tab<br>\
ls [..]    List directory contents<br>\
cd [..]    Change the working directory<br>\
cd [..] &  Open working directory in new tab<br>\
";
var dir_head = "<br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">.</span><br>\
drwxr-xr-x  2 chris chris 4.0K May  5 19:27 <span class=\"dir\">..</span>\
";
var directory = "drwx--x--x  2 chris chris 4.0K Jan  1 00:07 <span class=\"dir\">";
var symlink =   "lrwxrwxrwx  1 chris chris    4 May  4 12:33 <span class=\"symlink\">";
var pages = ["/about", "/projects"];
var commands = ["help", "clear", "back", "forward", "ls", "cd"];

var command_history = [""];
var history_offset = 0;

var working_dir = "/";

var stdout = document.getElementById("stdout")
var input = document.getElementById("terminal-input");

// A "dictionary" which stores all links on all pages
// Should look like this:
//      `links["/projects"] = [ { url = "https://duckduckgo.com", title = "duckduckgo" } ];`
var links = {};

// Show helpful hint as default message (instead of no JS warning)
stdout.innerHTML = hint;

// Check the last command and update stdout appropriately
function submit_command() {
    if (input.value === null || input.value === "") {
        return false;
    }

    // Update state
    var stdin = input.value.trim().toLowerCase();
    var command = stdin.split(" ");
    command_history.splice(1, 0, stdin);
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
            cd(command);
            break;
        case "exit":
            window.close();
            break;
        default:
            command_history.splice(1, 1);
            stdout.innerHTML =
                "\"" + command.join(" ") + "\" is not a valid command<br>" + hint;
  }

  return false;
}

function cd(command) {
    // Only parse directory if command contains one
    var dir = "/";
    if (command.length > 1) {
        dir = parse_dir(command[1]);
    }

    // Check if new tab should be opened
    var current_tab = true;
    if (command.length == 2 && command[1] == "&") {
        dir = "/";
        current_tab = false;
    }
    else if (command.length > 2 && command[2] == "&") {
        current_tab = false;
    }

    // Change to root when running just "cd"
    if (dir === "/") {
        open_link("index", current_tab);
        return;
    }

    // Open an internal page
    for (var i = 0; i < pages.length; i++) {
        if (pages[i] === dir) {
            // Trim "/" before opening "/projects"|"/about"
            open_link(pages[i].substring(1), current_tab);
            return;
        }
    }

    // Open an external symlink
    var base = parse_dir(dir + "/..");
    var available_links = links[base];
    if (available_links !== undefined) {
        for (var i = 0; i < available_links.length; i++) {
            var title_path = base + "/" + available_links[i]["title"];
            if (dir === title_path) {
                open_link(available_links[i]["url"], current_tab);
                return;
            }
        }
    }

    // Open a link
    if (command[1].startsWith("https://") || command[1].startsWith("http://")) {
        open_link(command[1], current_tab);
        return;
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
    if (dir === "/") {
        var text = "total " + (pages.length * 4 + 8) + "K";
        text += dir_head;
        for(var i = 0; i < pages.length; i++) {
            text += "<br>" + directory + pages[i].substring(1) + "</span>";
        }
        stdout.innerHTML = replace_whitespace(text);
        return;
    }

    // Show available links of target directory
    if (pages.includes(dir)) {
        var text = "total 8K";
        text += dir_head;

        // Show all available symlinks
        var available_links = links[dir];
        if (available_links !== undefined)
        {
            for (var i = 0; i < available_links.length; i++) {
                text += "<br>" + symlink + available_links[i]["title"] +
                    "</span> -> " + available_links[i]["url"];
            }
        }

        stdout.innerHTML = replace_whitespace(text);
        return;
    }

    // Show symlink targets
    var target_dir = parse_dir(dir + "/..");
    var available_links = links[target_dir];
    if (available_links !== undefined) {
        for (var i = 0; i < available_links.length; i++) {
            var target = target_dir + "/" + available_links[i]["title"];
            if (dir === target) {
                stdout.innerHTML = symlink + available_links[i]["title"] +
                    "</span> -> " + available_links[i]["url"];
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
    // Set the base directory to the current working directory if not absolute
    var target_dir = "";
    if (!directory.startsWith("/")) {
        target_dir = working_dir.substring(1);
    }

    // Append "/" to the end if missing
    if (target_dir !== "" && !target_dir.endsWith("/")) {
        target_dir += "/";
    }

    // Replace "~/" at beginning with fake home directory
    // These will all result in errors
    if (directory.startsWith("~/")) {
        directory = directory.substring(2);
        target_dir = "home/chris/";
    } else if (directory === "~") {
        target_dir = "home/chris/";
        directory = "";
    } else if (directory.startsWith("~")) {
        var index = directory.indexOf("/");
        if (index !== -1) {
            target_dir = "home/" + directory.substring(1, index + 1);
            directory = directory.substring(index + 1);
        } else {
            target_dir = "home/" + directory + "/";
            directory = "";
        }
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

    return "/" + target_dir;
}

// Replace whitespace with "&nbsp;" to prevent shortening
function replace_whitespace(input) {
  return input.replace(/  /g, "&nbsp;&nbsp;");
}

// Commmand completions
function complete() {
    // Split up user input
    var stdin = input.value.toLowerCase();
    var command = stdin.split(" ");

    // Setup array with all matching completions
    var matches = [];

    // Special case of empty command[1]
    var empty_base = false;
    if (command[1] == "") {
        empty_base = true;
        command[1] = "./";
    }

    // Complete commands
    if (command.length == 1) {
        for(var i = 0; i < commands.length; i++) {
            if (commands[i].startsWith(command[0])) {
                matches.push(commands[i] + " ");
            }
        }
    }
    // Special case for handling `.` and `..` inside paths
    else if (command[1].endsWith(".") || command[1].endsWith("..")) {
        input.value = input.value + "/";
    }
    else {
        // Complete pages
        let real_dir = parse_dir(command[1]);
        for (var i = 0; i < pages.length; i++) {
            // Make sure it starts with it, but is not a complete match
            if (pages[i].substring(0, pages[i].length - 1).startsWith(real_dir)
                // Is exact match and doesn't end with "/"
                || (pages[i] == real_dir && !command[1].endsWith("/")))
            {
                matches.push(command[0] + " " + replace_crumb(command[1], pages[i]) + "/");
            }
        }

        // Complete links
        // Only complete links if no pages were completed
        if (matches.length == 0)
        {
            // Get the "te" out of "/abc/te"
            var index = real_dir.lastIndexOf("/") + 1;
            var input_path_crumb = real_dir.substring(index);
            if (index == 2) {
                index = real_dir.length + 1;
                input_path_crumb = "";
            }

            // Get the "/abc" out of "/abc/te"
            var base = real_dir.substring(0, index - 1);
            var available_links = links[base];
            if (available_links !== undefined) {
                for (var i = 0; i < available_links.length; i++) {
                    var title = available_links[i]["title"];
                    if (title.startsWith(input_path_crumb)) {
                        matches.push(command[0] + " " + replace_crumb(command[1], title));
                    }
                }
            }
        }
    }

    // No matches found
    if (matches.length == 0) {
        return;
    }

    // Remove "./" from matches if command[1] was just ""
    if (empty_base) {
        for (var i = 0; i < matches.length; i++) {
            matches[i] = matches[i].replace("./", "");
        }
    }

    // Check available matches
    var first_match = matches[0];
    var match_len = 0;
    loop:
        while (match_len < first_match.length) {
            for (var j = 1; j < matches.length; j++) {
                if (first_match[match_len] != matches[j][match_len]) {
                    break loop;
                }
            }
            match_len++;
        }

    // Not a full match, print all options
    if (first_match.length != match_len) {
        // Get the portion of the last crumb inside the match
        var min_match = first_match.substring(0, match_len);
        var index = min_match.lastIndexOf("/");
        if (index == -1) {
            index = min_match.lastIndexOf(" ");
        }
        var last_crumb = min_match.substring(index + 1);

        // Get max match length and cut of the beginning of each match
        var minified_matches = [];
        var max_length = 0;
        for (var i = 0; i < matches.length; i++) {
            var minified_match = matches[i].substring(match_len);
            minified_matches.push(minified_match);

            if (minified_match.length > max_length) {
                max_length = minified_match.length;
            }
        }

        // Create the output string
        let output = last_crumb + minified_matches[0];
        for (var i = 1; i < minified_matches.length; i++) {
            // Add required whitespace to previous entry
            var missing = max_length - minified_matches[i - 1].length;
            output += Array(missing + 1).fill("&nbsp;").join("") + " ";

            // Add the element itself
            output += "<nobr>" + last_crumb + minified_matches[i] + "</nobr>";
        }

        // Print the available completions to stdout
        stdout.innerHTML = output;
    } else {
        // Clear stdout upon completion
        stdout.innerHTML = "";
    }

    // Set the stdin to the minimum match
    input.value = first_match.substring(0, match_len);
}

// Replace the last crumb of one paths with the one of another
// Creates "/abc/../abc/test" out of "/abc/../abc/te" + "/ggg/test"
function replace_crumb(path1, path2) {
    // Remove last crumb of first path "/abc/../abc/te" -> "/abc/../abc"
    var path1_index = path1.lastIndexOf("/");
    var base_path = path1.substring(0, path1_index);

    // Get last crumb of second path "/abc/test" -> "/test"
    var path2_index = path2.lastIndexOf("/");
    var crumb = path2.substring(path2_index);

    // Merge the path and the crumb
    if (path1_index == -1 && path2_index == -1) {
        return crumb;
    } else if (path1_index == -1) {
        return crumb.substring(1);
    } else if (path2_index == -1) {
        return base_path + "/" + crumb;
    } else {
        return base_path + crumb;
    }
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
        complete();
    }
    // <Up> for previous command
    else if (e.keyCode == 38) {
        if (history_offset >= (command_history.length - 1)) {
            return;
        }
        history_offset++;

        // Fill the input with the previous command
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

        // Fill the input with the next command
        var hist_command = command_history[history_offset];
        if (hist_command !== undefined) {
            input.value = hist_command;
        }
    }
}
document.addEventListener('keydown', keydown, true);

// Set the working directory to the current page
function set_working_dir() {
    var loc = document.location.href;
    var index = loc.lastIndexOf("/");
    if (index !== -1) {
        var page = "/" + loc.substring(index + "/".length);

        var elem = document.getElementById("ps1");
        if (elem !== null) {
            if (pages.includes(page)) {
                elem.innerHTML = page + " $";
                working_dir = page;
            } else {
                elem.innerHTML = "/ $";
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

// Focus termisal at beginning
input.focus();

// Parse the content of a page and add it to the links
function page_links_callback(page, responseText) {
    // Parse response text
    var parser = new DOMParser();
    var doc = parser.parseFromString(responseText, "text/html");

    // Add all links + titles
    var link_tags = doc.getElementsByTagName("a");
    if (link_tags.length >= 1) {
        links[page] = [];
    }
    for (var i = 0; i < link_tags.length; i++) {
        var title = link_tags[i].getElementsByClassName("link-title");
        if (title.length == 1) {
            var link = {};
            link["url"] = link_tags[i].href;
            link["title"] = title[0].innerHTML;
            links[page].push(link);
        }
    }
}

// Asynchronously load links + link titles for every page
function load_links() {
    for (var i = 0; i < pages.length; i++) {
        // Synchronously send a request to get the page
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", pages[i], false);
        xmlHttp.send(null);
        page_links_callback(pages[i], xmlHttp.responseText);
    }
}
load_links();

