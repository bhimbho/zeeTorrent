import { invoke } from "@tauri-apps/api/core";
import type { TorrentItem, AddTorrentResult } from "./types";

export function getDownloadDir(): Promise<string> {
  return invoke<string>("get_download_dir");
}

export function setDownloadDir(path: string): Promise<void> {
  return invoke("set_download_dir", { path });
}

export function addTorrent(
  magnetOrUrl: string,
  outputFolder?: string,
  paused?: boolean
): Promise<void> {
  return invoke<void>("add_torrent", {
    args: {
      magnetOrUrl,
      outputFolder: outputFolder ?? null,
      paused: paused ?? false,
    },
  });
}

export function addTorrentFile(
  torrentFileBase64: string,
  outputFolder?: string,
  paused?: boolean
): Promise<AddTorrentResult> {
  return invoke<AddTorrentResult>("add_torrent_file", {
    args: {
      torrentFileBase64,
      outputFolder: outputFolder ?? null,
      paused: paused ?? false,
    },
  });
}

export function listTorrents(): Promise<TorrentItem[]> {
  return invoke<{ torrents: TorrentItem[] }>("list_torrents").then((r) => r.torrents);
}

export function pauseTorrent(idOrHash: string): Promise<void> {
  return invoke("pause_torrent", { idOrHash });
}

export function resumeTorrent(idOrHash: string): Promise<void> {
  return invoke("resume_torrent", { idOrHash });
}

export function forgetTorrent(idOrHash: string): Promise<void> {
  return invoke("forget_torrent", { idOrHash });
}
