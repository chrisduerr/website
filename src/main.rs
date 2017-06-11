#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket_contrib;
extern crate rocket;

use rocket::response::{Flash, Redirect};
use rocket::request::FlashMessage;
use std::collections::BTreeMap;
use rocket_contrib::Template;
use std::fs::File;

const FILETYPES: &[&str] = &[".css", ".js", ".html"];

#[get("/")]
fn index(flash: Option<FlashMessage>) -> Template {
    let errorcode = flash.map_or(String::from(""), |f| f.msg().to_owned());
    let mut data = BTreeMap::new();
    data.insert("errorcode", errorcode);
    Template::render("index", data)
}

#[get("/<file>")]
fn static_file(mut file: String) -> Option<File> {
    if !file.contains('.') {
        file.push_str(".html");
    }

    let mut folder = String::from("static/");
    for ft in FILETYPES {
        if file.ends_with(ft) {
            folder.push_str(&ft[1..]);
        }
    }

    let path = folder + "/" + &file;
    File::open(&path).ok()
}

#[error(404)]
fn not_found() -> Flash<Redirect> {
    Flash::error(Redirect::to("/"), "404")
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index, static_file])
        .attach(Template::fairing())
        .catch(errors![not_found])
        .launch();
}
