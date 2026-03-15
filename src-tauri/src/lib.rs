use std::sync::Arc;

use tokio::runtime::Runtime;

use crate::engine::{SessionHolder, TorrentService};
use crate::state::AppState;

mod commands;
mod config;
mod engine;
mod state;

use commands::{
    add_torrent, add_torrent_file, forget_torrent, get_download_dir, list_torrents, pause_torrent,
    resume_torrent, set_download_dir,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let download_dir = config::load_download_dir();
    if let Err(e) = std::fs::create_dir_all(&download_dir) {
        eprintln!("Failed to create download dir: {}", e);
    }

    let rt = Runtime::new().expect("create runtime");
    let holder = rt
        .block_on(SessionHolder::new(download_dir))
        .expect("create session");
    let service = TorrentService::new(holder);
    let state = AppState {
        _runtime: Arc::new(rt),
        service,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_download_dir,
            set_download_dir,
            add_torrent,
            add_torrent_file,
            list_torrents,
            pause_torrent,
            resume_torrent,
            forget_torrent,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
