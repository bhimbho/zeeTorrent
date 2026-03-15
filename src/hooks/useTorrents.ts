import { useState, useEffect, useCallback } from "react";
import { listTorrents } from "../api";
import type { TorrentItem } from "../types";

const POLL_MS = 2000;

export function useTorrents() {
  const [torrents, setTorrents] = useState<TorrentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTorrents();
      setTorrents(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { torrents, refresh, loading, error };
}
