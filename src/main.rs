#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket_contrib;
extern crate rocket;

use rocket::response::{Flash, Redirect};
use rocket::request::FlashMessage;
use std::collections::BTreeMap;
use rocket_contrib::Template;

#[get("/")]
fn index(flash: Option<FlashMessage>) -> Template {
    let errorcode = flash.map_or(String::from(""), |f| f.msg().to_owned());
    let mut data = BTreeMap::new();
    data.insert("errorcode", errorcode);
    Template::render("index", data)
}

#[error(404)]
fn not_found() -> Flash<Redirect> {
    Flash::error(Redirect::to("/"), "404")
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index])
        .attach(Template::fairing())
        .catch(errors![not_found])
        .launch();
}
