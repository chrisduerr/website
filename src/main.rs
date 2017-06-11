#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket_contrib;
extern crate rocket;

#[cfg(test)]
mod test;
mod error;
mod html;
mod css;
mod js;

fn main() {
    rocket::ignite()
        .mount("/",
               routes![html::index,
                       html::about,
                       css::about,
                       css::index,
                       css::style,
                       css::small,
                       js::terminal,
                       error::not_found])
        .catch(errors![error::not_found_redirect])
        .launch();
}
