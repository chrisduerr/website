use std::fs::File;
use std::io;

#[get("/terminal.js")]
fn terminal() -> Result<File, io::Error> {
    File::open("js/terminal.js")
}
