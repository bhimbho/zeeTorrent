import { useState } from "react";
import { addTorrent, addTorrentFile, resumeTorrent, forgetTorrent } from "../api";
import { TORRENTS_REFRESH_EVENT } from "../events";
import type { AddTorrentResult, TorrentFile } from "../types";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatBytes(n: number): string {
  if (n === 0) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

function getPreviewFromResult(result: AddTorrentResult): {
  infoHash: string;
  name: string;
  totalBytes: number;
  files: { name: string; length: number }[];
} {
  const details = result.details ?? result;
  const infoHash =
    (details as { info_hash?: string })?.info_hash ??
    (details as { infoHash?: string })?.infoHash ??
    "";
  const name =
    (details as { name?: string })?.name ?? "Unknown";
  const rawFiles =
    (details as { files?: TorrentFile[] })?.files ?? [];
  const totalBytes = Array.isArray(rawFiles)
    ? rawFiles.reduce((s, f) => s + (f.length ?? 0), 0)
    : 0;
  return {
    infoHash,
    name: name ?? "Unknown",
    totalBytes,
    files: Array.isArray(rawFiles)
      ? rawFiles.map((f) => ({ name: f.name ?? "", length: f.length ?? 0 }))
      : [],
  };
}

export default function AddTorrentForm() {
  const [magnet, setMagnet] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    infoHash: string;
    name: string;
    totalBytes: number;
    files: { name: string; length: number }[];
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    setPreview(null);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      const result = await addTorrentFile(base64, undefined, true);
      setPreview(getPreviewFromResult(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function handleMagnetSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = magnet.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      await addTorrent(trimmed, undefined, false);
      setMagnet("");
      setConnecting(true);
      // Poll rapidly for 30s so the torrent appears as soon as metadata resolves
      let polls = 0;
      const id = setInterval(() => {
        window.dispatchEvent(new Event(TORRENTS_REFRESH_EVENT));
        polls += 1;
        if (polls >= 30) {
          clearInterval(id);
          setConnecting(false);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDownload() {
    if (!preview) return;
    setLoading(true);
    try {
      await resumeTorrent(preview.infoHash);
      setPreview(null);
      setMagnet("");
      window.dispatchEvent(new Event(TORRENTS_REFRESH_EVENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelPreview() {
    if (!preview) return;
    setLoading(true);
    try {
      await forgetTorrent(preview.infoHash);
      setPreview(null);
      window.dispatchEvent(new Event(TORRENTS_REFRESH_EVENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex">
        <label className="btn btn-primary">
          <input
            type="file"
            accept=".torrent"
            onChange={handleFileChange}
            disabled={loading}
            className="sr-only"
          />
          {loading ? "…" : "Upload .torrent file"}
        </label>
      </div>
      <form onSubmit={handleMagnetSubmit} className="flex" style={{ marginTop: "0.75rem", gap: "0.5rem" }}>
        <input
          type="text"
          value={magnet}
          onChange={(e) => setMagnet(e.target.value)}
          placeholder="Or paste magnet link"
          disabled={loading}
          className="input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <button type="submit" disabled={loading || !magnet.trim()} className="btn btn-primary">
          Add
        </button>
      </form>
      {connecting && (
        <p className="hint" style={{ marginTop: "0.5rem" }}>
          Connecting to peers, torrent will appear below shortly…
        </p>
      )}
      {error && <p className="error-msg">{error}</p>}

      {preview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancelPreview()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Preview</div>
            <div className="modal-body">
              <div className="torrent-name">{preview.name}</div>
              <div className="modal-meta">
                Size: {formatBytes(preview.totalBytes)}
                {preview.files.length > 0 && ` · ${preview.files.length} file(s)`}
              </div>
              <div className="modal-meta">Seeds: —</div>
              {preview.files.length > 0 && (
                <div className="modal-files">
                  <strong>Files</strong>
                  <ul>
                    {preview.files.slice(0, 30).map((f, i) => (
                      <li key={i} title={f.name}>
                        {f.name || "(unnamed)"} ({formatBytes(f.length)})
                      </li>
                    ))}
                    {preview.files.length > 30 && (
                      <li>… and {preview.files.length - 30} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleCancelPreview} className="btn btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDownload} className="btn btn-primary" disabled={loading}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
