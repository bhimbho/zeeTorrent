import type { TorrentItem } from "../types";
import { pauseTorrent, resumeTorrent, forgetTorrent } from "../api";

function toBps(
  v: number | { bytes_per_sec?: number } | undefined
): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return v.bytes_per_sec ?? 0;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return "0 B/s";
  const units = ["B/s", "KB/s", "MB/s", "GB/s"];
  let u = 0;
  let n = bytesPerSec;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

type Props = {
  torrent: TorrentItem;
  onAction: () => void;
};

export default function TorrentRow({ torrent, onAction }: Props) {
  const total = torrent.stats?.total_bytes ?? 0;
  const progress = total > 0 && torrent.stats
    ? Math.round((torrent.stats.progress_bytes / total) * 100)
    : 0;
  const isPaused = torrent.stats?.state === "paused";
  const isCompleted =
    (torrent.stats?.finished === true || progress >= 100) && total > 0;
  const statusLabel = isCompleted
    ? "Completed"
    : (torrent.stats?.state ?? "—");
  const down = toBps(torrent.stats?.live?.download_speed);
  const up = toBps(torrent.stats?.live?.upload_speed);

  async function handlePause() {
    try {
      await pauseTorrent(torrent.info_hash);
      onAction();
    } catch {
      onAction();
    }
  }

  async function handleResume() {
    try {
      await resumeTorrent(torrent.info_hash);
      onAction();
    } catch {
      onAction();
    }
  }

  async function handleForget() {
    try {
      await forgetTorrent(torrent.info_hash);
      onAction();
    } catch {
      onAction();
    }
  }

  return (
    <li className="torrent-row">
      <div className="flex-between" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="torrent-name">
            {torrent.name || torrent.info_hash}
          </div>
          <div className="torrent-meta">
            {progress}% · {statusLabel}
            {(down > 0 || up > 0) && (
              <span style={{ marginLeft: "0.5rem" }}>
                ↓ {formatSpeed(down)} · ↑ {formatSpeed(up)}
              </span>
            )}
          </div>
          <div className="torrent-progress-wrap">
            <div
              className={`torrent-progress-fill ${isCompleted ? "completed" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="torrent-actions">
          {isPaused ? (
            <button type="button" onClick={handleResume} className="btn btn-ghost">
              Resume
            </button>
          ) : (
            <button type="button" onClick={handlePause} className="btn btn-ghost">
              Pause
            </button>
          )}
          <button type="button" onClick={handleForget} className="btn btn-danger">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
