// share.harveycoombs.com
// written by Harvey Coombs, 2020-2024
use actix_web::{web, App, HttpServer};
use actix_files;
use std::time::{Duration, SystemTime};
use tokio::task;
use std::thread;

mod files;
mod routes;

use crate::files::files::*;
use crate::routes::routes::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    task::spawn(delete_old_uploads());

    HttpServer::new(|| {
        App::new()
            .service(actix_files::Files::new("/css", "./css").show_files_listing())
            .service(actix_files::Files::new("/js", "./js").show_files_listing())
            .route("/", web::get().to(index))
            .route("/uploads/{id}", web::get().to(uploads))
            .route("/upload", web::post().to(upload))
    })
    .bind(("localhost", 3002))?
    .run()
    .await
}

async fn delete_old_uploads() {
    loop {
        let uploads = list_directory_files("./uploads/");

        for upload in uploads {
            let path = &("./uploads/".to_owned() + upload.as_str());

            let now = SystemTime::now();
            let created = get_directory_creation_date(path);

            let age = match now.duration_since(created) {
                Ok(duration) => duration.as_secs(),
                Err(_) => 0
            };

            let hours = age / 3600;

            if hours >= 720 {
                delete_directory(path);
            }
        }

        thread::sleep(Duration::from_secs(60));
    }
}