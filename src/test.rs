use super::rocket;
use rocket::testing::MockRequest;
use rocket::http::{Status, Method};

#[test]
fn index() {
    let rocket = rocket::ignite().mount("/", routes![super::index]);
    let mut req = MockRequest::new(Method::Get, "/");
    let response = req.dispatch_with(&rocket);

    assert_eq!(response.status(), Status::Ok);
}
