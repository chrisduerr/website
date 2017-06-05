#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket_contrib;
extern crate rocket;

use std::collections::BTreeMap;
use rocket_contrib::Template;

#[cfg(test)]
mod test;

#[get("/")]
fn index() -> Template {
    let mut data = BTreeMap::new();
    data.insert("body", String::from("Hello, World!"));
    Template::render("index", &data)
}

#[error(404)]
fn not_found() -> &'static str {
    "Error 404 Placeholder"
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index])
        .catch(errors![not_found])
        .launch();
}
