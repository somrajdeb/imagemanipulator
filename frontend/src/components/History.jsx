
import { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  Download,
  Trash2,
  Image as ImageIcon,
  Search,
  RefreshCw,
  HardDrive,
} from "lucide-react";

const STORAGE_KEY = "compressionHistory";

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setHistory(Array.isArray(savedHistory) ? savedHistory : []);
    } catch (error) {
      console.error("Unable to load history:", error);
      setHistory([]);
    }
  }

  function deleteItem(id) {
    const updatedHistory = history.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    setHistory(updatedHistory);
  }

  function clearHistory() {
    if (history.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your entire compression history?"
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }

  function downloadItem(item) {
    if (item.cloudinaryUrl) {
      const link = document.createElement("a");

      link.href = item.cloudinaryUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();

      return;
    }

    if (item.downloadUrl) {
      const link = document.createElement("a");

      link.href = item.downloadUrl;
      link.download = item.outputName || "compressed-image";

      document.body.appendChild(link);
      link.click();
      link.remove();

      return;
    }

    alert(
      "This image has no saved Cloudinary URL. New compression records will support persistent access after the Compressor update."
    );
  }

  const filteredHistory = history.filter((item) =>
    (item.originalName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalSaved = history.reduce(
    (total, item) =>
      total +
      Math.max(
        0,
        (Number(item.originalSize) || 0) -
          (Number(item.compressedSize) || 0)
      ),
    0
  );

  return (
    <div className="space-y-7 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-violet-400">
            <HistoryIcon size={20} />
            <span className="text-sm font-semibold">
              Your Activity
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            Compression History
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View and manage your previously compressed images.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Total Compressions
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {history.length}
              </h2>
            </div>

            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
              <ImageIcon size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Total Space Saved
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {formatBytes(totalSaved)}
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
              <HardDrive size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-violet-500"
          />
        </div>

        <button
          onClick={clearHistory}
          disabled={history.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={16} />
          Clear History
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <HistoryIcon size={30} />
          </div>

          <h3 className="text-lg font-semibold">
            {searchTerm
              ? "No matching images found"
              : "No compression history yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            {searchTerm
              ? "Try searching with a different filename."
              : "Your completed compression jobs will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Image</th>
                  <th className="px-5 py-4 font-medium">Format</th>
                  <th className="px-5 py-4 font-medium">Original Size</th>
                  <th className="px-5 py-4 font-medium">Compressed</th>
                  <th className="px-5 py-4 font-medium">Saved</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-slate-800">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={18}
                              className="text-slate-400"
                            />
                          )}
                        </div>

                        <span className="max-w-[180px] truncate font-medium text-white">
                          {item.originalName || "Untitled image"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 uppercase text-slate-300">
                      {item.format || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatBytes(Number(item.originalSize) || 0)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatBytes(Number(item.compressedSize) || 0)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        {Number(item.savingsPercentage) || 0}% saved
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {item.date ? formatDate(item.date) : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => downloadItem(item)}
                          title="Open or download image"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-500/15 hover:text-violet-400"
                        >
                          <Download size={17} />
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          title="Delete"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
