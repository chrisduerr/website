use rocket::response::Redirect;
use std::fs::File;

#[error(404)]
fn not_found_redirect() -> Redirect {
    Redirect::to("/404")
}

#[get("/404")]
fn not_found() -> Result<File, &'static str> {
    File::open("html/index.html").or(Err("Error 404"))
}
