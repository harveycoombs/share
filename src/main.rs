// share.harveycoombs.com
// written by Harvey Coombs, 2020-2024
use actix_web::{web, App, HttpServer};
use actix_files;

mod files;
mod routes;

use crate::routes::routes::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(actix_files::Files::new("/css", "./css").show_files_listing())
            .service(actix_files::Files::new("/js", "./js").show_files_listing())
            .service(actix_files::Files::new("/fonts", "./fonts").show_files_listing())
            .route("/", web::get().to(index))
            .route("/uploads/{id}", web::get().to(uploads))
            .route("/upload", web::post().to(upload))
    })
    .bind(("localhost", 3002))?
    .run()
    .await
}