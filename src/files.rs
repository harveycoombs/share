pub mod files {
    use std::fs;
    use std::fs::File;
    use std::io::{self, Read};
    use std::path::Path;
    use std::time::SystemTime;

    pub fn read_file(path: &str) -> io::Result<String> {
        let mut file = File::open(path)?;
    
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
    
        Ok(contents)
    }
    
    pub fn list_directory_files(path: &str) -> Vec<String> {
        if !directory_exists(path) {
            return Vec::new();
        }
        
        fs::read_dir(path)
            .unwrap()
            .filter_map(|entry| entry.ok().and_then(|e| e.file_name().into_string().ok()))
            .collect()
    }

    pub fn directory_exists(path: &str) -> bool {
        let path = Path::new(path);
        path.exists() && path.is_dir()
    }

    pub fn create_directory(path: &str) -> bool {
        match fs::create_dir_all(path) {
            Ok(_) => true,
            Err(_) => false,
        }
    }

    pub fn delete_directory(path: &str) -> bool {
        match fs::remove_dir_all(path) {
            Ok(_) => true,
            Err(_) => false,
        }
    }

    pub fn get_directory_creation_date(path: &str) -> SystemTime {
        match fs::metadata(path) {
            Ok(data) => {
                match data.created() {
                    Ok(created) => created,
                    Err(_) => SystemTime::now()
                }
            },
            Err(_) => SystemTime::now()
        }
    }
}