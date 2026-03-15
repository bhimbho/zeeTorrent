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
  finished?: boolean;
  live?: LiveStats | null;
}

export interface LiveStats {
  download_speed?: number | { bytes_per_sec?: number };
  upload_speed?: number | { bytes_per_sec?: number };
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
