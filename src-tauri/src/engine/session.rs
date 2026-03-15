use std::path::PathBuf;
use std::sync::Arc;

use librqbit::api::Api;
use librqbit::Session;

#[derive(Clone)]
pub struct SessionHolder {
    session: Arc<Session>,
    download_dir: PathBuf,
}

impl SessionHolder {
    pub async fn new(download_dir: PathBuf) -> anyhow::Result<Self> {
        let session = Session::new(download_dir.clone()).await?;
        Ok(Self {
            session,
            download_dir,
        })
    }

    pub fn api(&self) -> Api {
        Api::new(Arc::clone(&self.session), None)
    }

    pub fn download_dir(&self) -> &PathBuf {
        &self.download_dir
    }
}
