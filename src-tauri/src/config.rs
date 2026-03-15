use std::path::PathBuf;

fn config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|d| d.join("zeetorrent").join("download_dir.txt"))
}

pub fn load_download_dir() -> PathBuf {
    let path = match config_path() {
        Some(p) => p,
        None => return default_download_dir(),
    };
    match std::fs::read_to_string(&path) {
        Ok(s) => {
            let s = s.trim();
            if s.is_empty() {
                default_download_dir()
            } else {
                PathBuf::from(s)
            }
        }
        Err(_) => default_download_dir(),
    }
}

pub fn save_download_dir(path: &str) -> std::io::Result<()> {
    if let Some(config_path) = config_path() {
        if let Some(parent) = config_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(config_path, path.trim())?;
    }
    Ok(())
}

fn default_download_dir() -> PathBuf {
    dirs::download_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("zeetorrent")
}
