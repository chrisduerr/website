var projects_offset = 0;
var projects_step = 3;
var max_projects = 3;

// Event handler for keyboard shortcuts
function keydown(e) {
    // <Left> for previous project
    if (e.keyCode == 37) {
        e.preventDefault();
        prev_projects();
    }
    // <Right> for next project
    else if (e.keyCode == 39) {
        e.preventDefault();
        next_projects();
    }
}
document.addEventListener('keydown', keydown, true);

// Cycle to previous projects
function prev_projects() {
    if (projects_offset <= 0) {
        // If end was reached, loop to the other side
        update_projects(false);
        projects_offset = max_projects;
        update_projects(true);
    } else {
        update_projects(false);
        projects_offset -= projects_step;
        update_projects(true);
    }
}
document.getElementById("projects-prev").addEventListener('click', prev_projects);

// Cycle to next projects
function next_projects() {
    if (projects_offset >= max_projects) {
        // If end was reached, loop to the other side
        update_projects(false);
        projects_offset = 0;
        update_projects(true);
    } else {
        update_projects(false);
        projects_offset += projects_step;
        update_projects(true);
    }
}
document.getElementById("projects-next").addEventListener('click', next_projects);

// Update the visibility of all currently active projects
function update_projects(visible) {
    for (var i = projects_offset; i < (projects_offset + projects_step); i++) {
        console.log("SETTING " + i + " TO " + visible);
        var proj = document.getElementById("project-" + i);
        var sep = document.getElementById("project-" + i + "-separator");
        set_visibility(proj, visible)
        set_visibility(sep, visible)
    }
}

// Set the visibility of a specific item
function set_visibility(item, visible) {
    if (item === null || item === undefined) {
        return;
    }

    if (visible) {
        item.style = "";
    } else {
        item.style = "display: none";
    }
}

// Remove link from prev/next because that's for non-JS
document.getElementById("projects-prev").innerHTML = "&lt;"
document.getElementById("projects-next").innerHTML = "&gt;"

// Set terminal hint to display keyboard shortcuts
var stdout = document.getElementById("stdout")
stdout.innerHTML = "You can use &lt;Left&gt;/&lt;Right&gt; to navigate this page";

