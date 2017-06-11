use std::fs::File;
use std::io;

#[get("/style.css")]
fn style() -> Result<File, io::Error> {
    File::open("css/style.css")
}

#[get("/index.css")]
fn index() -> Result<File, io::Error> {
    File::open("css/index.css")
}

#[get("/small.css")]
fn small() -> Result<File, io::Error> {
    File::open("css/small.css")
}

#[get("/about.css")]
fn about() -> Result<File, io::Error> {
    File::open("css/about.css")
}
