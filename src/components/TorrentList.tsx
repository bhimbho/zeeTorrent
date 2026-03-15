import { useEffect } from "react";
import { useTorrents } from "../hooks/useTorrents";
import { TORRENTS_REFRESH_EVENT } from "../events";
import TorrentRow from "./TorrentRow";

export default function TorrentList() {
  const { torrents, refresh, loading, error } = useTorrents();

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(TORRENTS_REFRESH_EVENT, handler);
    return () => window.removeEventListener(TORRENTS_REFRESH_EVENT, handler);
  }, [refresh]);

  if (error) {
    return <p className="error-msg">Failed to load torrents: {error}</p>;
  }

  if (torrents.length === 0 && !loading) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        No torrents. Upload a .torrent file or open a magnet link with zeetorrent.
      </p>
    );
  }

  return (
    <section>
      <div className="flex-between" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Torrents
        </h2>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn btn-ghost"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>
      <ul className="torrent-list">
        {torrents.map((t) => (
          <TorrentRow key={t.info_hash} torrent={t} onAction={refresh} />
        ))}
      </ul>
    </section>
  );
}
