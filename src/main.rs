// share.harveycoombs.com 
// written by Harvey Coombs, 2020-2024
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_files;
use actix_multipart::Multipart;
use futures::TryStreamExt;
use futures::StreamExt;
use std::fs;
use std::fs::File;
use std::io::{self, Read, Write};
use zip::ZipWriter;
use zip::write::FileOptions;
use std::time::{SystemTime, UNIX_EPOCH};

async fn index() -> impl Responder {
    match read_file("./views/index.html") {
        Ok(content) => HttpResponse::Ok().body(content),
        Err(ex) => HttpResponse::InternalServerError().body(format!("ERR! {}", ex))
    }
}

async fn uploads(id: web::Path<String>) -> impl Responder {
    let files = list_directory_files("./uploads", &id);

    if files.len() > 1 {
        let mut archive = File::create(format!("./uploads/{}.zip", id)).unwrap();
        let mut writer = ZipWriter::new(&mut archive);

        let options = FileOptions::default().compression_method(zip::CompressionMethod::Stored);

        for file_name in files {
            match fs::read(&format!("./uploads/{}", file_name)) {
                Ok(bytes) => {
                    let original_filename = file_name.replace(&format!("{}-", id), "");
    
                    writer.start_file(original_filename, options).unwrap();
                    writer.write(&bytes).unwrap();
                },
                Err(ex) => {
                    eprintln!("ERR! {}", ex);
                }
            }                
        }

        writer.finish().unwrap();

        let mut zip_file = File::open(format!("./uploads/{}.zip", id)).unwrap();
        let mut data = Vec::new();

        zip_file.read_to_end(&mut data).unwrap();

        return HttpResponse::Ok()
            .content_type("application/zip")
            .body(data)
    } else if let Some(file_name) = files.first() {
        match fs::read(&format!("./uploads/{}", file_name)) {
            Ok(bytes) => {
                let original_filename = file_name.replace(&format!("{}-", id), "");

                return HttpResponse::Ok()
                    .content_type("application/octet-stream")
                    .header("Content-Disposition", format!("attachment; filename=\"{}\"", original_filename))
                    .body(bytes);
            },
            Err(ex) => {
                eprintln!("ERR! {}", ex);
            }
        }
    }

    HttpResponse::InternalServerError().finish()
}

async fn upload(mut payload: Multipart) -> impl Responder {
    let now = SystemTime::now();
    let unix = now.duration_since(UNIX_EPOCH).expect("ERR");
    let ms = unix.as_millis();

    while let Ok(Some(mut field)) = payload.try_next().await {
        let context = field.content_disposition();
        let filename = context.get_filename().unwrap();

        let path = format!("./uploads/{}-{}", ms.to_string(), filename);
        let mut file = File::create(path).unwrap();

        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            file.write_all(&data).unwrap();
        }
    }

    HttpResponse::Ok().body(format!("{{ \"id\": \"{}\" }}", ms))
}

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
    .bind(("127.0.0.1", 3002))?
    .run()
    .await
}

fn read_file(path: &str) -> io::Result<String> {
    let mut file = File::open(path)?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    Ok(contents)
}

fn list_directory_files(path: &str, prefix: &str) -> Vec<String> {
    fs::read_dir(path)
        .unwrap()
        .filter_map(|entry| entry.ok().and_then(|e| e.file_name().into_string().ok()))
        .filter(|file_name| file_name.starts_with(prefix))
        .collect()
}