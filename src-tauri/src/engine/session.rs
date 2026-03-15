use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use librqbit::api::Api;
use librqbit::{PeerConnectionOptions, Session, SessionOptions};

fn default_trackers() -> HashSet<url::Url> {
    [
        "udp://tracker.opentrackr.org:1337/announce",
        "udp://open.stealth.si:80/announce",
        "udp://tracker.torrent.eu.org:451/announce",
        "udp://exodus.desync.com:6969",
        "udp://tracker.tiny-vps.com:6969/announce",
        "udp://open.demonii.com:1337/announce",
        "udp://tracker.dler.org:6969/announce",
        "udp://public.popcorn-tracker.org:6969/announce",
    ]
    .into_iter()
    .filter_map(|s| s.parse().ok())
    .collect()
}

#[derive(Clone)]
pub struct SessionHolder {
    session: Arc<Session>,
    download_dir: PathBuf,
}

impl SessionHolder {
    pub async fn new(download_dir: PathBuf) -> anyhow::Result<Self> {
        let mut opts = SessionOptions::default();
        opts.listen_port_range = Some(50_000..50_100);
        opts.enable_upnp_port_forwarding = true;
        opts.trackers = default_trackers();
        opts.peer_opts = Some(PeerConnectionOptions {
            connect_timeout: Some(Duration::from_secs(30)),
            read_write_timeout: Some(Duration::from_secs(120)),
            keep_alive_interval: Some(Duration::from_secs(60)),
        });
        opts.concurrent_init_limit = Some(8);
        opts.defer_writes_up_to = Some(128);
        let session = Session::new_with_opts(download_dir.clone(), opts).await?;
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
