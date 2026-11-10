
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  Image as ImageIcon,
  Download,
  Settings2,
  X,
  CheckCircle2,
  Loader2,
  FileImage,
  RefreshCw,
  ArrowDown,
  Sparkles,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const HISTORY_KEY = "compressionHistory";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function saveToHistory(record) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([record, ...existing])
    );
  } catch (error) {
    console.error("Could not save compression history:", error);
  }
}

export default function Compressor() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);

  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [rotation, setRotation] = useState(0);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [preview, result]);

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    setError("");
    setResult(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a JPEG, PNG, WebP or AVIF image.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("Image size must be below 20 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    if (result?.url) URL.revokeObjectURL(result.url);

    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function compressImage() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("format", format);
      formData.append("quality", String(quality));
      formData.append("width", String(width));
      formData.append("height", String(height));
      formData.append("rotation", String(rotation));

      const response = await axios.post(
        `${API_URL}/api/images/compress`,
        formData,
        {
          responseType: "blob",
          onUploadProgress: (event) => {
            if (event.total) {
              const percentage = Math.round(
                (event.loaded * 100) / event.total
              );
              setProgress(percentage);
            }
          },
        }
      );

      const contentType =
        response.headers["content-type"] || `image/${format}`;

      if (!contentType.startsWith("image/")) {
        const message = await response.data.text();
        throw new Error(message || "Invalid image response.");
      }

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const downloadUrl = URL.createObjectURL(blob);

      const originalSize = file.size;
      const compressedSize = blob.size;

      const savings =
        originalSize > 0
          ? ((originalSize - compressedSize) / originalSize) * 100
          : 0;

      const outputName = `${file.name.replace(/\.[^/.]+$/, "")}-compressed.${format}`;

      // Read Cloudinary response headers.
      const cloudinaryUrl =
        response.headers["x-cloudinary-url"] || "";

      const cloudinaryPublicId =
        response.headers["x-cloudinary-public-id"] || "";

      setResult({
        url: downloadUrl,
        blob,
        originalSize,
        compressedSize,
        savings,
        format,
      });

      // Save compression details and Cloudinary information.
      const historyRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        originalName: file.name,
        outputName,
        format,
        originalSize,
        compressedSize,
        savingsPercentage: Number(savings.toFixed(1)),
        date: new Date().toISOString(),
        cloudinaryUrl,
        cloudinaryPublicId,
      };

      saveToHistory(historyRecord);

      setProgress(100);
    } catch (err) {
      let message = "Image compression failed.";

      if (err.response?.data instanceof Blob) {
        try {
          const data = await err.response.data.text();
          const parsed = JSON.parse(data);
          message = parsed.message || message;
        } catch {
          message = "The server returned an invalid response.";
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.url;
    link.download = `imageflow-compressed.${result.format}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const formats = ["webp", "jpeg", "png", "avif"];

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <Sparkles size={14} />
          IMAGE OPTIMIZATION STUDIO
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Image Compressor
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Reduce image size while maintaining excellent visual quality.
        </p>
      </div>

      {/* Image upload section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Upload your image
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select an image to begin.
            </p>
          </div>

          {file && (
            <button
              onClick={removeFile}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              <X size={15} />
              Remove
            </button>
          )}
        </div>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              selectFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragging
                ? "border-violet-500 bg-violet-100"
                : "border-violet-200 bg-violet-50/50 hover:border-violet-400 hover:bg-violet-50"
            }`}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <UploadCloud size={31} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Drag and drop your image here
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Or click below to browse your computer.
            </p>

            <span className="mt-5 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white">
              Choose Image
            </span>

            <p className="mt-5 text-xs text-slate-400">
              JPEG, PNG, WebP, AVIF · Maximum 20 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => selectFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold">
                <ImageIcon size={16} className="text-violet-600" />
                Original image
              </div>

              <div className="flex h-64 items-center justify-center p-4">
                <img
                  src={preview}
                  alt="Original upload"
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-violet-100 bg-violet-50/50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <FileImage size={24} />
              </div>

              <h3 className="font-bold text-slate-900">
                Image selected successfully
              </h3>

              <p className="mt-2 break-all text-xs text-slate-500">
                {file.name}
              </p>

              <p className="mt-3 text-sm text-slate-600">
                Original size: <strong>{formatSize(file.size)}</strong>
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Choose another image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => selectFile(e.target.files[0])}
              />
            </div>
          </div>
        )}
      </section>

      {/* Compression settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
            <Settings2 size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Compression settings
            </h2>
            <p className="text-xs text-slate-500">
              Customize your output image.
            </p>
          </div>
        </div>

        <div className="mb-7">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Output format
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {formats.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setFormat(item);
                  setResult(null);
                }}
                className={`rounded-xl border px-3 py-4 text-sm font-bold uppercase transition ${
                  format === item
                    ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
                    : "border-slate-200 text-slate-500 hover:border-violet-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Compression quality
            </label>
            <span className="rounded-lg bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
              {quality}%
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => {
              setQuality(Number(e.target.value));
              setResult(null);
            }}
            className="w-full accent-violet-600"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>

        <div className="mb-7">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Image dimensions
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-slate-500">
                Width (px)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-500">
                Height (px)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Rotation
          </label>

          <select
            value={rotation}
            onChange={(e) => {
              setRotation(Number(e.target.value));
              setResult(null);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 sm:max-w-xs"
          >
            <option value="0">No rotation</option>
            <option value="90">90° clockwise</option>
            <option value="180">180°</option>
            <option value="270">270° clockwise</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Processing progress */}
      {loading && (
        <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 size={21} className="animate-spin text-violet-600" />
              <span className="text-sm font-semibold text-slate-800">
                Processing your image...
              </span>
            </div>

            <span className="text-sm font-bold text-violet-700">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Upload progress is displayed here. The server processes the image after upload.
          </p>
        </section>
      )}

      <button
        onClick={compressImage}
        disabled={!file || loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Compressing...
          </>
        ) : (
          <>
            <Sparkles size={19} />
            Compress Image
          </>
        )}
      </button>

      {/* Compression result */}
      {result && (
        <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle2 size={25} className="text-emerald-600" />

            <div>
              <h2 className="font-bold text-slate-900">
                Compression successful!
              </h2>
              <p className="text-xs text-slate-500">
                Your optimized image is ready.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Original size</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {formatSize(result.originalSize)}
              </h3>
            </div>

            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-xs text-violet-600">Compressed size</p>
              <h3 className="mt-2 text-xl font-bold text-violet-700">
                {formatSize(result.compressedSize)}
              </h3>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">Size reduction</p>
              <h3 className="mt-2 text-xl font-bold text-emerald-700">
                {result.savings >= 0
                  ? `${result.savings.toFixed(1)}%`
                  : `${Math.abs(result.savings).toFixed(1)}% larger`}
              </h3>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={downloadImage}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <Download size={18} />
              Download Image
            </button>

            <button
              onClick={() => setResult(null)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-emerald-700">
            <ArrowDown size={15} />
            Output format: {result.format.toUpperCase()}
          </div>
        </section>
      )}
    </div>
  );
}
