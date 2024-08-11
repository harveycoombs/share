pub mod files {
    use std::fs;
    use std::fs::File;
    use std::io::{self, Read};

    pub fn read_file(path: &str) -> io::Result<String> {
        let mut file = File::open(path)?;
    
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
    
        Ok(contents)
    }
    
    pub fn list_directory_files(path: &str, prefix: &str) -> Vec<String> {
        fs::read_dir(path)
            .unwrap()
            .filter_map(|entry| entry.ok().and_then(|e| e.file_name().into_string().ok()))
            .filter(|file_name| file_name.starts_with(prefix))
            .collect()
    }
}