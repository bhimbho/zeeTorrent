import type { TorrentItem } from "../types";
import { pauseTorrent, resumeTorrent, forgetTorrent } from "../api";

function formatBytes(n: number): string {
  if (n === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

type Props = { torrent: TorrentItem; onAction: () => void };

export default function TorrentRow({ torrent, onAction }: Props) {
  const stats = torrent.stats;
  const total = stats?.total_bytes ?? 0;
  const progress = total > 0 && stats ? Math.round((stats.progress_bytes / total) * 100) : 0;
  const isPaused = stats?.state === "paused";
  const isCompleted = (stats?.finished === true || progress >= 100) && total > 0;

  const live = stats?.live;
  const downSpeed = live?.download_speed?.human_readable;
  const upSpeed = live?.upload_speed?.human_readable;
  const eta = live?.time_remaining?.human_readable;
  const peers = live?.snapshot?.peer_stats;
  const livePeers = peers?.live ?? 0;
  const connectingPeers = peers?.connecting ?? 0;
  const totalPeers = livePeers + connectingPeers;

  const statusLabel = isCompleted ? "Completed" : (stats?.state ?? "—");

  async function handlePause() {
    try { await pauseTorrent(torrent.info_hash); } finally { onAction(); }
  }
  async function handleResume() {
    try { await resumeTorrent(torrent.info_hash); } finally { onAction(); }
  }
  async function handleForget() {
    try { await forgetTorrent(torrent.info_hash); } finally { onAction(); }
  }

  return (
    <li className="torrent-row">
      <div className="flex-between" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="torrent-name">{torrent.name || torrent.info_hash}</div>

          <div className="torrent-stats-row">
            <span className={`torrent-status-badge ${isCompleted ? "completed" : stats?.state ?? ""}`}>
              {statusLabel}
            </span>
            {total > 0 && (
              <span className="torrent-meta">{formatBytes(stats?.progress_bytes ?? 0)} / {formatBytes(total)}</span>
            )}
            {stats?.uploaded_bytes != null && stats.uploaded_bytes > 0 && (
              <span className="torrent-meta">↑ {formatBytes(stats.uploaded_bytes)}</span>
            )}
          </div>

          {!isCompleted && (downSpeed || upSpeed || totalPeers > 0 || eta) && (
            <div className="torrent-live-row">
              {downSpeed && <span className="live-stat">↓ {downSpeed}</span>}
              {upSpeed && <span className="live-stat">↑ {upSpeed}</span>}
              {totalPeers > 0 && (
                <span className="live-stat">
                  {livePeers} peer{livePeers !== 1 ? "s" : ""}
                  {connectingPeers > 0 && ` (${connectingPeers} connecting)`}
                </span>
              )}
              {eta && !isCompleted && <span className="live-stat eta">ETA {eta}</span>}
            </div>
          )}

          <div className="torrent-progress-wrap">
            <div
              className={`torrent-progress-fill ${isCompleted ? "completed" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="torrent-progress-label">{progress}%</div>
        </div>

        <div className="torrent-actions">
          {isPaused ? (
            <button type="button" onClick={handleResume} className="btn btn-ghost">Resume</button>
          ) : (
            <button type="button" onClick={handlePause} className="btn btn-ghost" disabled={isCompleted}>Pause</button>
          )}
          <button type="button" onClick={handleForget} className="btn btn-danger">Remove</button>
        </div>
      </div>
    </li>
  );
}
