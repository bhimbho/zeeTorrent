use std::path::PathBuf;

use bytes::Bytes;
use librqbit::api::{ApiTorrentListOpts, TorrentIdOrHash};
use librqbit::{AddTorrent, AddTorrentOptions};

use super::SessionHolder;

#[derive(Clone)]
pub struct TorrentService {
    holder: SessionHolder,
}

impl TorrentService {
    pub fn new(holder: SessionHolder) -> Self {
        Self { holder }
    }

    pub fn download_dir(&self) -> PathBuf {
        self.holder.download_dir().clone()
    }

    fn add_torrent_opts(
        &self,
        output_folder: Option<&str>,
        paused: bool,
    ) -> AddTorrentOptions {
        let mut opts = AddTorrentOptions::default();
        opts.paused = paused;
        opts.overwrite = true;
        opts.defer_writes = Some(true);
        if let Some(p) = output_folder {
            opts.output_folder = Some(p.to_string());
        }
        opts
    }

    pub async fn add_torrent(
        &self,
        magnet_or_url: &str,
        output_folder: Option<&str>,
        paused: bool,
    ) -> anyhow::Result<serde_json::Value> {
        let add = AddTorrent::from_url(magnet_or_url);
        let api = self.holder.api();
        let opts = self.add_torrent_opts(output_folder, paused);
        let response = api.api_add_torrent(add, Some(opts)).await?;
        Ok(serde_json::to_value(response)?)
    }

    pub async fn add_torrent_file(
        &self,
        base64_bytes: &str,
        output_folder: Option<&str>,
        paused: bool,
    ) -> anyhow::Result<serde_json::Value> {
        use base64::Engine;
        let decoded = base64::engine::general_purpose::STANDARD.decode(base64_bytes.trim())?;
        let add = AddTorrent::TorrentFileBytes(Bytes::from(decoded));
        let api = self.holder.api();
        let opts = self.add_torrent_opts(output_folder, paused);
        let response = api.api_add_torrent(add, Some(opts)).await?;
        Ok(serde_json::to_value(response)?)
    }

    pub fn list_torrents(&self) -> anyhow::Result<serde_json::Value> {
        let api = self.holder.api();
        let opts = ApiTorrentListOpts { with_stats: true };
        let response = api.api_torrent_list_ext(opts);
        Ok(serde_json::to_value(response)?)
    }

    pub async fn pause(&self, id_or_hash: &str) -> anyhow::Result<()> {
        let idx = TorrentIdOrHash::parse(id_or_hash)?;
        let api = self.holder.api();
        api.api_torrent_action_pause(idx).await?;
        Ok(())
    }

    pub async fn resume(&self, id_or_hash: &str) -> anyhow::Result<()> {
        let idx = TorrentIdOrHash::parse(id_or_hash)?;
        let api = self.holder.api();
        api.api_torrent_action_start(idx).await?;
        Ok(())
    }

    pub async fn forget(&self, id_or_hash: &str) -> anyhow::Result<()> {
        let idx = TorrentIdOrHash::parse(id_or_hash)?;
        let api = self.holder.api();
        api.api_torrent_action_forget(idx).await?;
        Ok(())
    }
}
