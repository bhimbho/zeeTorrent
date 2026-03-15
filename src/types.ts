export interface TorrentItem {
  id?: number;
  info_hash: string;
  name: string | null;
  output_folder: string;
  stats?: TorrentStats | null;
}

export interface TorrentStats {
  state: string;
  progress_bytes: number;
  total_bytes: number;
  uploaded_bytes?: number;
  finished?: boolean;
  live?: LiveStats | null;
}

export interface LiveStats {
  download_speed?: { mbps: number; human_readable: string };
  upload_speed?: { mbps: number; human_readable: string };
  time_remaining?: { human_readable: string } | null;
  snapshot?: {
    peer_stats?: PeerStats;
  };
}

export interface PeerStats {
  queued: number;
  connecting: number;
  live: number;
  seen: number;
  dead: number;
  not_needed: number;
}

export interface AddTorrentResult {
  id?: number;
  details: TorrentDetails;
  output_folder: string;
}

export interface TorrentDetails {
  info_hash: string;
  name: string | null;
  output_folder: string;
  files: TorrentFile[] | null;
}

export interface TorrentFile {
  name: string;
  length: number;
}
