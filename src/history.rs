pub mod history {
    use actix_web::{cookie::Cookie, HttpRequest};

    use crate::files::files::*;

    pub fn insert_history(request: HttpRequest, upload_id: &u128) -> Cookie {
        let mut existing_history: Vec<u128> = get_history(request);

        existing_history.push(upload_id.to_owned());

        let json: String = match serde_json::to_string(&existing_history) {
            Ok(data) => data,
            Err(_) => "[]".to_string()
        };

        return Cookie::build("history", json)
                .path("/")
                .http_only(true)
                .finish();
    }

    pub fn get_history(request: HttpRequest) -> Vec<u128> {
        let mut ids: Vec<u128> = Vec::new();

        if let Some(cookie) = request.cookie("history") {
            ids = match serde_json::from_str(cookie.value()) {
                Ok(data) => filter_out_deleted_uploads_from_history(data),
                Err(_) => Vec::new()
            };
        }

        return ids;
    }

    pub fn filter_out_deleted_uploads_from_history(ids: Vec<u128>) -> Vec<u128> {
        let filtered_ids = ids.into_iter()
            .filter(|id| directory_exists(&format!("./uploads/{}", id)));

        return filtered_ids.collect();
    }
}