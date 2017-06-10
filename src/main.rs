#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket_contrib;
extern crate rocket;

use rocket::response::Redirect;
use std::collections::BTreeMap;
use rocket_contrib::Template;
use std::io::{self, Read};
use std::fs::File;

#[cfg(test)]
mod test;

#[get("/")]
fn index() -> Result<File, io::Error> {
    File::open("html/index.html")
}

#[get("/style.css")]
fn style() -> Result<File, io::Error> {
    File::open("css/style.css")
}

#[get("/terminal.js")]
fn terminal() -> Result<File, io::Error> {
    File::open("js/terminal.js")
}

// This can never fail
#[get("/404")]
fn not_found() -> Result<File, &'static str> {
    File::open("html/index.html").or(Err("Error 404"))
}

#[error(404)]
fn not_found_redirect() -> Redirect {
    Redirect::to("/404")
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index, style, terminal, not_found])
        .catch(errors![not_found_redirect])
        .launch();
}
