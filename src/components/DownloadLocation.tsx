import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getDownloadDir, setDownloadDir } from "../api";

export default function DownloadLocation() {
  const [path, setPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const p = await getDownloadDir();
      setPath(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleChange() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      try {
        await setDownloadDir(selected);
        setPath(selected);
      } catch {
        // keep previous path
      }
    }
  }

  if (loading) return null;

  return (
    <div className="card">
      <div className="card-label">Download location</div>
      <div className="flex-between">
        <span
          className="torrent-name"
          style={{ flex: 1, minWidth: 0 }}
          title={path ?? undefined}
        >
          {path ?? "—"}
        </span>
        <button type="button" onClick={handleChange} className="btn btn-ghost">
          Change
        </button>
      </div>
      <div className="hint">Takes effect after you restart the app.</div>
    </div>
  );
}
