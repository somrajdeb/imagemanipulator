
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import {
  Upload,
  Images,
  X,
  FileImage,
  Download,
  Archive,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Play,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 20;
const HISTORY_KEY = "compressionHistory";

const formats = ["webp", "jpeg", "png", "avif"];

function getExtension(format) {
  return format === "jpeg" ? "jpg" : format;
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function saveToHistory(record) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    const updated = [record, ...existing];

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("Could not save batch history:", error);
  }
}

function BatchCompressor() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [message, setMessage] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [batchFinished, setBatchFinished] = useState(false);

  const fileInputRef = useRef(null);
  const filesRef = useRef([]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  const completedCount = files.filter(
    (item) => item.status === "Completed"
  ).length;

  const failedCount = files.filter(
    (item) => item.status === "Failed"
  ).length;

  const overallProgress =
    files.length > 0
      ? Math.round(
          ((completedCount + failedCount) / files.length) * 100
        )
      : 0;

  const addFiles = (selectedFiles) => {
    setMessage("");
    setBatchFinished(false);
    setZipUrl("");

    const incomingFiles = Array.from(selectedFiles);

    if (files.length + incomingFiles.length > MAX_FILES) {
      setMessage(`You can select a maximum of ${MAX_FILES} images.`);
      return;
    }

    const validFiles = [];

    for (const file of incomingFiles) {
      if (!file.type.startsWith("image/")) {
        setMessage(`${file.name} is not a valid image.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setMessage(`${file.name} exceeds the 20 MB limit.`);
        continue;
      }

      validFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: "Waiting",
        blob: null,
        error: null,
      });
    }

    setFiles((previous) => [...previous, ...validFiles]);
  };

  const removeFile = (id) => {
    if (isProcessing) return;

    setFiles((previous) => {
      const item = previous.find((file) => file.id === id);

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      return previous.filter((file) => file.id !== id);
    });

    setBatchFinished(false);
    setZipUrl("");
  };

  const clearFiles = () => {
    if (isProcessing) return;

    files.forEach((item) => URL.revokeObjectURL(item.preview));

    setFiles([]);
    setMessage("");
    setBatchFinished(false);
    setZipUrl("");
  };

  const updateFile = (id, updates) => {
    setFiles((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const compressBatch = async () => {
    if (files.length === 0) {
      setMessage("Please select images before starting compression.");
      return;
    }

    setIsProcessing(true);
    setMessage("");
    setBatchFinished(false);
    setZipUrl("");

    setFiles((previous) =>
      previous.map((item) => ({
        ...item,
        status: "Waiting",
        blob: null,
        error: null,
      }))
    );

    const currentFiles = [...files];

    for (const item of currentFiles) {
      updateFile(item.id, {
        status: "Compressing",
        error: null,
      });

      try {
        const formData = new FormData();

        formData.append("image", item.file);
        formData.append("format", format);
        formData.append("quality", String(quality));
        formData.append("width", width || "");
        formData.append("height", height || "");
        formData.append("rotation", "0");

        const response = await axios.post(
          `${API_URL}/api/images/compress`,
          formData,
          {
            responseType: "blob",
          }
        );

        const contentType =
          response.headers["content-type"] || `image/${format}`;

        if (!contentType.startsWith("image/")) {
          const errorText = await response.data.text();
          throw new Error(errorText || "Invalid image response.");
        }

        const compressedBlob = new Blob([response.data], {
          type: contentType,
        });

        const originalSize = item.file.size;
        const compressedSize = compressedBlob.size;

        const savingsPercentage =
          originalSize > 0
            ? ((originalSize - compressedSize) / originalSize) * 100
            : 0;

        const originalName = item.file.name.replace(/\.[^/.]+$/, "");
        const outputName = `${originalName}_compressed.${getExtension(format)}`;

        // Save successful image compression to History.
        saveToHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          originalName: item.file.name,
          outputName,
          format,
          originalSize,
          compressedSize,
          savingsPercentage: Number(savingsPercentage.toFixed(1)),
          date: new Date().toISOString(),
        });

        updateFile(item.id, {
          status: "Completed",
          blob: compressedBlob,
          error: null,
        });
      } catch (error) {
        let errorMessage = "Compression failed.";

        if (error.response?.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = "Unable to process this image.";
          }
        } else {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            errorMessage;
        }

        updateFile(item.id, {
          status: "Failed",
          error: errorMessage,
        });
      }
    }

    setIsProcessing(false);
    setBatchFinished(true);
  };

  const downloadZip = async () => {
    const successfulFiles = files.filter(
      (item) => item.status === "Completed" && item.blob
    );

    if (successfulFiles.length === 0) {
      setMessage("There are no successfully compressed images to download.");
      return;
    }

    setIsCreatingZip(true);
    setMessage("");

    try {
      const zip = new JSZip();

      successfulFiles.forEach((item) => {
        const originalName = item.file.name.replace(/\.[^/.]+$/, "");
        const extension = getExtension(format);

        zip.file(
          `${originalName}_compressed.${extension}`,
          item.blob
        );
      });

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "compressed_images.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setMessage("Could not create the ZIP file. Please try again.");
    } finally {
      setIsCreatingZip(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* PAGE HEADING */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
          <Images size={16} />
          <span>Image Tools / Batch Compressor</span>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Batch Compressor
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Compress multiple images together and download them in one ZIP file.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();

          if (!isProcessing) {
            addFiles(event.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!isProcessing) fileInputRef.current?.click();
        }}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-10 text-center transition hover:border-violet-500 hover:bg-violet-500/5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
          <Upload size={30} />
        </div>

        <h3 className="text-lg font-semibold text-white">
          Drop your images here
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Or click to browse files from your computer
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Maximum 20 images · 20 MB per image
        </p>
      </div>

      {/* SETTINGS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 font-semibold text-white">
            Compression Settings
          </h3>

          <label className="mb-2 block text-sm text-slate-300">
            Output Format
          </label>

          <div className="grid grid-cols-4 gap-2">
            {formats.map((item) => (
              <button
                key={item}
                disabled={isProcessing}
                onClick={() => setFormat(item)}
                className={`rounded-lg border px-2 py-3 text-sm font-semibold uppercase transition ${
                  format === item
                    ? "border-violet-500 bg-violet-500/15 text-violet-300"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm text-slate-300">
                Image Quality
              </label>

              <span className="font-semibold text-violet-400">
                {quality}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              disabled={isProcessing}
              onChange={(event) =>
                setQuality(Number(event.target.value))
              }
              className="w-full accent-violet-500"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 font-semibold text-white">
            Resize Settings
          </h3>

          <p className="mb-4 text-sm text-slate-400">
            Optional: Set dimensions for all selected images.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Width (px)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Original"
                value={width}
                disabled={isProcessing}
                onChange={(event) => setWidth(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Height (px)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Original"
                value={height}
                disabled={isProcessing}
                onChange={(event) => setHeight(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Leave both fields empty to keep the original dimensions.
          </p>
        </div>
      </div>

      {/* SELECTED FILES */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">
              Selected Images ({files.length}/{MAX_FILES})
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Review your images before starting compression.
            </p>
          </div>

          {files.length > 0 && (
            <button
              onClick={clearFiles}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 size={15} />
              Clear All
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 py-12 text-center">
            <FileImage
              size={36}
              className="mx-auto mb-3 text-slate-600"
            />

            <p className="text-sm text-slate-400">
              No images selected yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
              >
                <div className="relative h-40 bg-slate-800">
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-full w-full object-contain"
                  />

                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white hover:bg-red-500"
                      title="Remove image"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <p className="truncate text-sm font-medium text-white">
                    {item.file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatBytes(item.file.size)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Status
                    </span>

                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        item.status === "Completed"
                          ? "text-green-400"
                          : item.status === "Failed"
                          ? "text-red-400"
                          : item.status === "Compressing"
                          ? "text-violet-400"
                          : "text-slate-400"
                      }`}
                    >
                      {item.status === "Completed" && (
                        <CheckCircle2 size={13} />
                      )}

                      {item.status === "Failed" && (
                        <AlertCircle size={13} />
                      )}

                      {item.status === "Compressing" && (
                        <Loader2 size={13} className="animate-spin" />
                      )}

                      {item.status}
                    </span>
                  </div>

                  {item.error && (
                    <p className="text-xs text-red-400">
                      {item.error}
                    </p>
                  )}

                  {item.blob && (
                    <p className="text-xs text-green-400">
                      Output: {formatBytes(item.blob.size)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROGRESS */}
      {isProcessing || batchFinished ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Batch Progress
            </h3>

            <span className="text-sm font-semibold text-violet-400">
              {overallProgress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
            <span>{completedCount} completed</span>
            <span>{failedCount} failed</span>
            <span>
              {files.length - completedCount - failedCount} remaining
            </span>
          </div>
        </div>
      ) : null}

      {/* MESSAGES */}
      {message && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {message}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={compressBatch}
          disabled={files.length === 0 || isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Compressing Images...
            </>
          ) : (
            <>
              <Play size={18} />
              Start Batch Compression
            </>
          )}
        </button>

        <button
          onClick={downloadZip}
          disabled={
            completedCount === 0 ||
            isProcessing ||
            isCreatingZip
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-4 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isCreatingZip ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating ZIP...
            </>
          ) : (
            <>
              <Archive size={18} />
              Download ZIP
              <Download size={16} />
            </>
          )}
        </button>
      </div>

      {batchFinished && completedCount > 0 && (
        <p className="text-sm text-green-400">
          Batch processing finished. {completedCount} image(s) compressed successfully.
          {failedCount > 0 && ` ${failedCount} image(s) failed.`}
          {" "}Successful images have been added to History.
        </p>
      )}
    </div>
  );
}

export default BatchCompressor;
