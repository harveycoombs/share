pub mod routes {
    use actix_web::{web, HttpRequest, HttpResponse, Responder, cookie::Cookie};
    use actix_web::web::Bytes;
    use actix_multipart::Multipart;
    use futures::{StreamExt, TryStreamExt};
    use futures::stream::once;
    use std::fs;
    use std::fs::File;
    use std::io::{Read, Write};
    use zip::ZipWriter;
    use zip::write::FileOptions;
    use std::time::{SystemTime, UNIX_EPOCH};
    use mime_guess::from_path;
    use std::sync::{Arc, Mutex};
    use lazy_static::lazy_static;

    use crate::files::files::*;
    use crate::history::history::*;

    lazy_static! {
        static ref ALREADY_CHUNKED: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
    }    

    pub async fn index() -> impl Responder {
        match read_file("./views/index.html") {
            Ok(content) => HttpResponse::Ok().content_type("text/html").body(content),
            Err(ex) => HttpResponse::InternalServerError().body(format!("ERR! {}", ex))
        }
    }
    
    pub async fn uploads(id: web::Path<String>) -> impl Responder {
        let target_files = list_directory_files(&format!("./uploads/{}", id));
    
        if target_files.len() == 0 {
            return HttpResponse::Ok().body("File(s) not found");
        } else if target_files.len() > 1 {
            let mut archive = File::create(format!("./uploads/{}.zip", id)).unwrap();
            let mut writer = ZipWriter::new(&mut archive);
    
            let options = FileOptions::default().compression_method(zip::CompressionMethod::Stored);
    
            for file_name in target_files {
                match fs::read(&format!("./uploads/{}/{}", id, file_name)) {
                    Ok(bytes) => {
                        writer.start_file(file_name, options).unwrap();
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
        } else if let Some(file_name) = target_files.first() {
            let mut already_chunked = ALREADY_CHUNKED.lock().unwrap();
            
            match fs::read(&format!("./uploads/{}/{}", id, file_name)) {
                Ok(bytes) => {
                    let content_type = from_path(format!("./uploads/{}", file_name)).first_or_octet_stream();
    
                    if bytes.len() > 2000000 && !*already_chunked {
                        let chunk_size = 104857600.0;
                        let remaining_chunks = (bytes.len() as f64) % chunk_size;
    
                        let mut chunks: Vec<Vec<u8>> = bytes.chunks(chunk_size as usize)
                            .map(|chunk| chunk.to_vec())
                            .collect();
    
                        if let Some(remaining_chunks) = bytes.chunks(chunk_size as usize).last() {
                            chunks.push(remaining_chunks.to_vec());
                        }
    
                        let streams = chunks.into_iter().map(|chunk| {
                            let chunk = Bytes::from(chunk);
                            once(Box::pin(async move { Ok::<_, std::io::Error>(chunk.to_vec()) }))
                        });
    
                        let combined_streams = futures::stream::select_all(streams);
                        let converted_streams = combined_streams.map(|result| {
                            result.map(|bytes| {
                                let vec_bytes: Vec<u8> = bytes.to_vec();
                                actix_web::web::Bytes::from(vec_bytes)
                            })
                        });
    
                        *already_chunked = true;
    
                        return HttpResponse::Ok()
                            .content_type(content_type)
                            .streaming(converted_streams)
                    } else {
                        return HttpResponse::Ok()
                            .content_type(content_type)
                            .body(bytes);
                    }
                },
                Err(ex) => {
                    eprintln!("ERR! {}", ex);
                }
            }
        }
    
        HttpResponse::InternalServerError().finish()
    }
    
    pub async fn upload(mut payload: Multipart, request: HttpRequest) -> impl Responder {
        let now = SystemTime::now();
        let unix = now.duration_since(UNIX_EPOCH).expect("ERR");
        let ms = unix.as_millis();
    
        let dir = format!("./uploads/{}", ms);

        if !create_directory(&dir) {
            return HttpResponse::Ok().body("{{ \"error\": \"Unable to create upload directory.\" }}");
        }

        while let Ok(Some(mut field)) = payload.try_next().await {
            let context = field.content_disposition();
            let filename = context.get_filename().unwrap();
    
            let path = format!("{}/{}", dir, filename);
            let mut file = File::create(path).unwrap();
    
            while let Some(chunk) = field.next().await {
                let data = chunk.unwrap();
                file.write_all(&data).unwrap();
            }
        }

        let history_cookie: Cookie = insert_history(request, &ms);
    
        return HttpResponse::Ok()
            .cookie(history_cookie)
            .content_type("application/json")
            .body(format!("{{ \"id\": \"{}\" }}", ms))
    }

    pub async fn history(request: HttpRequest) -> impl Responder {
        let history = get_history(request);
        let json = serde_json::to_string(&history).unwrap();

        return HttpResponse::Ok()
            .content_type("application/json")
            .body(format!("{{ \"history\": {} }}", json));
    }
}