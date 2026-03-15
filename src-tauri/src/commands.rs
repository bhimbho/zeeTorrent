use std::sync::Arc;

use serde::Deserialize;
use tauri::State;

use crate::state::AppState;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddTorrentArgs {
    magnet_or_url: String,
    #[serde(default)]
    output_folder: Option<String>,
    #[serde(default)]
    paused: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddTorrentFileArgs {
    torrent_file_base64: String,
    #[serde(default)]
    output_folder: Option<String>,
    #[serde(default)]
    paused: bool,
}

#[tauri::command]
pub async fn get_download_dir(state: State<'_, AppState>) -> Result<String, String> {
    let path = state.service.download_dir();
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn set_download_dir(path: String) -> Result<(), String> {
    crate::config::save_download_dir(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_torrent(
    state: State<'_, AppState>,
    args: AddTorrentArgs,
) -> Result<(), String> {
    let service = state.service.clone();
    let url = args.magnet_or_url.clone();
    let folder = args.output_folder.clone();
    let paused = args.paused;
    tokio::spawn(async move {
        if let Err(e) = service.add_torrent(&url, folder.as_deref(), paused).await {
            eprintln!("add_torrent error: {e}");
        }
    });
    Ok(())
}

/// Runs add_torrent_file on the dedicated librqbit runtime so its internal
/// tokio handles are always on the same executor, then returns the full
/// response for the preview modal.
#[tauri::command]
pub async fn add_torrent_file(
    state: State<'_, AppState>,
    args: AddTorrentFileArgs,
) -> Result<serde_json::Value, String> {
    let service = state.service.clone();
    let rt = Arc::clone(&state._runtime);
    let base64 = args.torrent_file_base64.clone();
    let folder = args.output_folder.clone();
    let paused = args.paused;

    tokio::task::spawn_blocking(move || {
        rt.block_on(service.add_torrent_file(&base64, folder.as_deref(), paused))
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_torrents(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    state.service.list_torrents().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pause_torrent(
    state: State<'_, AppState>,
    id_or_hash: String,
) -> Result<(), String> {
    state.service.pause(&id_or_hash).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resume_torrent(
    state: State<'_, AppState>,
    id_or_hash: String,
) -> Result<(), String> {
    state.service.resume(&id_or_hash).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn forget_torrent(
    state: State<'_, AppState>,
    id_or_hash: String,
) -> Result<(), String> {
    state.service.forget(&id_or_hash).await.map_err(|e| e.to_string())
}
