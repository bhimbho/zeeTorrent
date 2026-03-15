use std::sync::Arc;

use tokio::runtime::Runtime;

use crate::engine::TorrentService;

pub struct AppState {
    pub _runtime: Arc<Runtime>,
    pub service: TorrentService,
}
