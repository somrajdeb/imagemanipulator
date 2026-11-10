
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  RotateCcw,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Crop,
  Scaling,
  Lock,
  Unlock,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const outputFormats = ["jpeg", "png", "webp", "avif"];

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ResizeCrop() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [cropMode, setCropMode] = useState("centre");
  const [editedBlob, setEditedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const previewRef = useRef("");
  const downloadUrlRef = useRef("");

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }

      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");
    setSuccess(false);
    setEditedBlob(null);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Maximum image size allowed is 20 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(selectedFile);
    const image = new window.Image();

    image.onload = () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }

      previewRef.current = imageUrl;
      setPreview(imageUrl);
      setFile(selectedFile);

      setOriginalWidth(image.naturalWidth);
      setOriginalHeight(image.naturalHeight);

      setWidth(String(image.naturalWidth));
      setHeight(String(image.naturalHeight));

      setRotation(0);
      setSuccess(false);
      setEditedBlob(null);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      setError("Could not read this image.");
    };

    image.src = imageUrl;
  };

  const handleWidthChange = (value) => {
    setWidth(value);
    setEditedBlob(null);
    setSuccess(false);

    const newWidth = Number(value);

    if (keepRatio && newWidth > 0 && originalWidth > 0) {
      setHeight(
        String(
          Math.max(
            1,
            Math.round(
              (newWidth * originalHeight) / originalWidth
            )
          )
        )
      );
    }
  };

  const handleHeightChange = (value) => {
    setHeight(value);
    setEditedBlob(null);
    setSuccess(false);

    const newHeight = Number(value);

    if (keepRatio && newHeight > 0 && originalHeight > 0) {
      setWidth(
        String(
          Math.max(
            1,
            Math.round(
              (newHeight * originalWidth) / originalHeight
            )
          )
        )
      );
    }
  };

  const changeRotation = (degrees) => {
    setRotation((previous) => (previous + degrees + 360) % 360);
    setEditedBlob(null);
    setSuccess(false);
  };

  const resetSettings = () => {
    if (!file) return;

    setWidth(String(originalWidth));
    setHeight(String(originalHeight));
    setRotation(0);
    setKeepRatio(true);
    setCropMode("centre");
    setFormat("webp");
    setQuality(85);
    setEditedBlob(null);
    setSuccess(false);
    setError("");
  };

  const processImage = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    const numericWidth = Number(width);
    const numericHeight = Number(height);

    if (
      !Number.isInteger(numericWidth) ||
      !Number.isInteger(numericHeight) ||
      numericWidth < 1 ||
      numericHeight < 1
    ) {
      setError("Please enter valid width and height values.");
      return;
    }

    if (numericWidth > 10000 || numericHeight > 10000) {
      setError("Maximum width and height allowed is 10000 pixels.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess(false);
    setEditedBlob(null);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("format", format);
      formData.append("quality", String(quality));
      formData.append("width", String(numericWidth));
      formData.append("height", String(numericHeight));
      formData.append("rotation", String(rotation));
      formData.append("cropMode", cropMode);

      const response = await axios.post(
        `${API_URL}/api/images/compress`,
        formData,
        {
          responseType: "blob",
        }
      );

      setEditedBlob(response.data);
      setSuccess(true);
    } catch (err) {
      let errorMessage = "Image processing failed.";

      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        } catch {
          errorMessage = "Unable to process this image.";
        }
      } else {
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!editedBlob || !file) return;

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
    }

    const url = URL.createObjectURL(editedBlob);
    downloadUrlRef.current = url;

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const extension = format === "jpeg" ? "jpg" : format;

    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}_edited.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const removeImage = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = "";
    }

    previewRef.current = "";

    setFile(null);
    setPreview("");
    setWidth("");
    setHeight("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setRotation(0);
    setEditedBlob(null);
    setSuccess(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-7">

      {/* PAGE HEADING */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-500">
          <Scaling size={16} />
          <span>Image Tools / Resize & Crop</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Resize & Crop
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Resize your images, adjust dimensions, rotate and optimize them.
        </p>
      </div>

      {/* UPLOAD */}
      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-white p-8 text-center transition hover:border-violet-400 hover:bg-violet-50/50"
        >
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

          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Upload size={30} />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            Upload an image
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Select an image to begin resizing and editing.
          </p>

          <p className="mt-4 text-xs text-slate-400">
            JPEG · PNG · WebP · AVIF · Maximum 20 MB
          </p>
        </button>
      ) : (
        <>
          {/* IMAGE AND SETTINGS */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

            {/* IMAGE PREVIEW */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">
                  Image Preview
                </h2>

                <button
                  onClick={removeImage}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
                >
                  Remove Image
                </button>
              </div>

              <div className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-4">
                <img
                  src={preview}
                  alt="Original preview"
                  className="max-h-[420px] max-w-full rounded-lg object-contain transition-transform duration-300"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(file.size)}
                  </p>
                </div>

                <div className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                  {originalWidth} × {originalHeight} px
                </div>
              </div>

              {/* ROTATION */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Rotate Image
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => changeRotation(-90)}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"
                  >
                    <RotateCcw size={17} />
                    Left 90°
                  </button>

                  <button
                    onClick={() => changeRotation(90)}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"
                  >
                    <RotateCw size={17} />
                    Right 90°
                  </button>

                  <button
                    onClick={() => {
                      setRotation(0);
                      setEditedBlob(null);
                      setSuccess(false);
                    }}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"
                  >
                    <RefreshCw size={17} />
                    Reset
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Current rotation: {rotation}°
                </p>
              </div>
            </div>

            {/* SETTINGS */}
            <div className="space-y-6">

              {/* RESIZE SETTINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Scaling size={19} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-900">
                    Resize Dimensions
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-600">
                      Width (px)
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={width}
                      disabled={isProcessing}
                      onChange={(event) =>
                        handleWidthChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-600">
                      Height (px)
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={height}
                      disabled={isProcessing}
                      onChange={(event) =>
                        handleHeightChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setKeepRatio((previous) => !previous)}
                  disabled={isProcessing}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    keepRatio
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {keepRatio ? (
                    <Lock size={17} />
                  ) : (
                    <Unlock size={17} />
                  )}

                  {keepRatio
                    ? "Aspect Ratio Locked"
                    : "Aspect Ratio Unlocked"}
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  When locked, changing one dimension automatically adjusts
                  the other dimension to maintain the original proportions.
                </p>
              </div>

              {/* CROP SETTINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Crop size={19} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-900">
                    Crop Position
                  </h2>
                </div>

                <label className="mb-3 block text-sm text-slate-600">
                  Select crop strategy
                </label>

                <select
                  value={cropMode}
                  disabled={isProcessing}
                  onChange={(event) => {
                    setCropMode(event.target.value);
                    setEditedBlob(null);
                    setSuccess(false);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-500"
                >
                  <option value="centre">Centre Crop</option>
                  <option value="attention">Attention Crop</option>
                  <option value="entropy">Entropy Crop</option>
                </select>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Crop strategies determine which part of an image is
                  prioritised when the output dimensions have a different
                  aspect ratio.
                </p>
              </div>

              {/* OUTPUT SETTINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-slate-900">
                  Output Settings
                </h2>

                <label className="mb-2 block text-sm text-slate-600">
                  Output Format
                </label>

                <select
                  value={format}
                  disabled={isProcessing}
                  onChange={(event) => {
                    setFormat(event.target.value);
                    setEditedBlob(null);
                    setSuccess(false);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500"
                >
                  {outputFormats.map((item) => (
                    <option key={item} value={item}>
                      {item.toUpperCase()}
                    </option>
                  ))}
                </select>

                <div className="mb-3 mt-6 flex items-center justify-between">
                  <label className="text-sm text-slate-600">
                    Quality
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
                  disabled={isProcessing}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    setEditedBlob(null);
                    setSuccess(false);
                  }}
                  className="w-full accent-violet-600"
                />
              </div>

            </div>
          </div>

          {/* RESET AND PROCESS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetSettings}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <RefreshCw size={17} />
              Reset Settings
            </button>

            <button
              onClick={processImage}
              disabled={isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Processing Image...
                </>
              ) : (
                <>
                  <ImageIcon size={19} />
                  Apply Changes
                </>
              )}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {/* RESULT */}
          {success && editedBlob && (
            <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Image Processed Successfully!
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your resized and edited image is ready.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Original Size
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {formatBytes(file.size)}
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Edited Size
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {formatBytes(editedBlob.size)}
                  </h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Output Dimensions
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {width} × {height}
                  </h3>
                </div>
              </div>

              <button
                onClick={downloadImage}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white hover:bg-green-700"
              >
                <Download size={19} />
                Download Edited Image
              </button>
            </div>
          )}
        </>
      )}

      {error && !file && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />
          {error}
        </div>
      )}
    </div>
  );
}

export default ResizeCrop;
