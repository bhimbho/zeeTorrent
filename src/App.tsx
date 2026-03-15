import AddTorrentForm from "./components/AddTorrentForm";
import DownloadLocation from "./components/DownloadLocation";
import TorrentList from "./components/TorrentList";

export default function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">wtorrent</h1>
      </header>
      <DownloadLocation />
      <AddTorrentForm />
      <TorrentList />
    </main>
  );
}
