use std::fs::File;
use std::io;

#[get("/")]
fn index() -> Result<File, io::Error> {
    File::open("html/index.html")
}

#[get("/about")]
fn about() -> Result<File, io::Error> {
    File::open("html/about.html")
}
