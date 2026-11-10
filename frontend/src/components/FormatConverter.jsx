
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Upload,
  FileImage,
  ArrowRightLeft,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const HISTORY_KEY = "compressionHistory";

const formats = [
  { value: "jpeg", label: "JPEG", description: "Good for photographs" },
  { value: "png", label: "PNG", description: "Supports transparency" },
  { value: "webp", label: "WebP", description: "Smaller modern images" },
  { value: "avif", label: "AVIF", description: "High compression efficiency" },
];

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(format) {
  return format === "jpeg" ? "jpg" : format;
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
    console.error("Could not save conversion history:", error);
  }
}

function FormatConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const downloadUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, [preview]);

  const originalFormat = file?.type?.split("/")[1]?.toLowerCase();

  const outputSize = convertedBlob?.size || 0;
  const originalSize = file?.size || 0;

  const savings =
    originalSize > 0 && outputSize > 0
      ? ((originalSize - outputSize) / originalSize) * 100
      : 0;

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");
    setSuccess(false);
    setConvertedBlob(null);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 20 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(imageUrl);

    const detectedFormat = selectedFile.type
      .split("/")[1]
      ?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp", "avif"].includes(detectedFormat)) {
      setOutputFormat(
        detectedFormat === "jpg" ? "jpeg" : detectedFormat
      );
    } else {
      setOutputFormat("webp");
    }
  };

  const convertImage = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsConverting(true);
    setError("");
    setSuccess(false);
    setConvertedBlob(null);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("format", outputFormat);
      formData.append("quality", String(quality));
      formData.append("width", "");
      formData.append("height", "");
      formData.append("rotation", "0");

      const response = await axios.post(
        `${API_URL}/api/images/compress`,
        formData,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || `image/${outputFormat}`;

      if (!contentType.startsWith("image/")) {
        const responseText = await response.data.text();
        throw new Error(responseText || "Invalid image response.");
      }

      const blob = new Blob([response.data], {
        type: contentType,
      });

      setConvertedBlob(blob);

      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const extension = getExtension(outputFormat);
      const outputName = `${originalName}_converted.${extension}`;

      const savingsPercentage =
        file.size > 0
          ? ((file.size - blob.size) / file.size) * 100
          : 0;

      // Add the successful conversion to History.
      saveToHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        originalName: file.name,
        outputName,
        format: outputFormat,
        originalSize: file.size,
        compressedSize: blob.size,
        savingsPercentage: Number(savingsPercentage.toFixed(1)),
        date: new Date().toISOString(),
      });

      setSuccess(true);
    } catch (err) {
      let errorMessage = "Image conversion failed.";

      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        } catch {
          errorMessage = "Unable to convert this image.";
        }
      } else {
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedBlob || !file) return;

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
    }

    const url = URL.createObjectURL(convertedBlob);
    downloadUrlRef.current = url;

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const extension = getExtension(outputFormat);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}_converted.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const resetConverter = () => {
    if (preview) URL.revokeObjectURL(preview);

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    setFile(null);
    setPreview("");
    setConvertedBlob(null);
    setError("");
    setSuccess(false);
    setOutputFormat("webp");
    setQuality(85);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-500">
          <ArrowRightLeft size={16} />
          <span>Image Tools / Format Converter</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Format Converter
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Convert your images between JPEG, PNG, WebP and AVIF formats.
        </p>
      </div>

      {/* Format overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {formats.map((format) => (
          <div
            key={format.value}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <FileImage size={21} />
            </div>

            <h3 className="font-bold text-slate-800">
              {format.label}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {format.description}
            </p>
          </div>
        ))}
      </div>

      {/* Main converter */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-slate-900">
            1. Upload Image
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[310px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Upload size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                Upload an image
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Click to browse your files
              </p>

              <p className="mt-4 text-xs text-slate-400">
                Maximum file size: 20 MB
              </p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex min-h-[250px] items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-3">
                <img
                  src={preview}
                  alt="Original image preview"
                  className="max-h-[290px] max-w-full rounded-lg object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(file.size)} · {originalFormat || "Unknown"} format
                  </p>
                </div>

                <button
                  onClick={resetConverter}
                  disabled={isConverting}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isConverting}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Choose another image
              </button>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-slate-900">
            2. Conversion Settings
          </h2>

          <label className="mb-3 block text-sm font-medium text-slate-700">
            Convert To
          </label>

          <div className="grid grid-cols-2 gap-3">
            {formats.map((format) => (
              <button
                key={format.value}
                disabled={isConverting}
                onClick={() => {
                  setOutputFormat(format.value);
                  setConvertedBlob(null);
                  setSuccess(false);
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  outputFormat === format.value
                    ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                    : "border-slate-200 hover:border-violet-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {format.label}
                  </span>

                  {outputFormat === format.value && (
                    <CheckCircle2
                      size={17}
                      className="text-violet-600"
                    />
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {format.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Output Quality
              </label>

              <span className="font-bold text-violet-600">
                {quality}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              disabled={isConverting}
              onChange={(event) => {
                setQuality(Number(event.target.value));
                setConvertedBlob(null);
                setSuccess(false);
              }}
              className="w-full accent-violet-600"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </div>

          <div className="mt-7 rounded-xl bg-violet-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles
                size={19}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-violet-900">
                  Conversion tip
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-700">
                  WebP and AVIF can reduce file size considerably.
                  PNG is useful when you need lossless output and transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Convert button */}
      <button
        onClick={convertImage}
        disabled={!file || isConverting}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isConverting ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Converting Image...
          </>
        ) : (
          <>
            <ArrowRightLeft size={19} />
            Convert Image
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {/* Result */}
      {success && convertedBlob && (
        <div className="space-y-5 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Conversion Successful!
              </h2>

              <p className="text-xs text-slate-500">
                Your image has been converted to {outputFormat.toUpperCase()}.
                It has also been added to History.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Original Size
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-800">
                {formatBytes(originalSize)}
              </h3>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Converted Size
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-800">
                {formatBytes(outputSize)}
              </h3>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Size Difference
              </p>

              <h3
                className={`mt-2 text-xl font-bold ${
                  savings >= 0 ? "text-green-600" : "text-orange-500"
                }`}
              >
                {savings >= 0
                  ? `${savings.toFixed(1)}% smaller`
                  : `${Math.abs(savings).toFixed(1)}% larger`}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadImage}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Download size={18} />
              Download Converted Image
            </button>

            <button
              onClick={resetConverter}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Start Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormatConverter;
