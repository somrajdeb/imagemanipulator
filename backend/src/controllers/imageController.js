
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");

const supportedFormats = ["jpeg", "png", "webp", "avif"];

const mimeTypes = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif"
};

const compressImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image."
      });
    }

    const format = (req.body.format || "webp").toLowerCase();

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported image format."
      });
    }

    const quality = Number(req.body.quality ?? 80);

    if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
      return res.status(400).json({
        success: false,
        message: "Quality must be between 1 and 100."
      });
    }

    const metadata = await sharp(req.file.buffer).metadata();

    if (!supportedFormats.includes(metadata.format)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsupported image content."
      });
    }

    let pipeline = sharp(req.file.buffer, {
      limitInputPixels: 40000000
    });

    const width = req.body.width ? Number(req.body.width) : null;
    const height = req.body.height ? Number(req.body.height) : null;

    if (
      (width !== null && (!Number.isInteger(width) || width < 1 || width > 10000)) ||
      (height !== null && (!Number.isInteger(height) || height < 1 || height > 10000))
    ) {
      return res.status(400).json({
        success: false,
        message: "Width and height must be between 1 and 10000."
      });
    }

    if (width || height) {
      pipeline = pipeline.resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    const rotation = Number(req.body.rotation ?? 0);

    if (![0, 90, 180, 270].includes(rotation)) {
      return res.status(400).json({
        success: false,
        message: "Rotation must be 0, 90, 180 or 270."
      });
    }

    if (rotation !== 0) {
      pipeline = pipeline.rotate(rotation);
    }

    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({
          quality,
          mozjpeg: true
        });
        break;

      case "png":
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          palette: true
        });
        break;

      case "webp":
        pipeline = pipeline.webp({
          quality,
          effort: 4
        });
        break;

      case "avif":
        pipeline = pipeline.avif({
          quality,
          effort: 4
        });
        break;
    }

    // Generate compressed image
    const outputBuffer = await pipeline.toBuffer();

    const originalSize = req.file.size;
    const compressedSize = outputBuffer.length;

    const savedBytes = originalSize - compressedSize;

    const savingsPercentage = (
      (savedBytes / originalSize) * 100
    ).toFixed(2);

    const originalName = req.file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const filename = `${originalName}-compressed.${format}`;

    // Upload compressed image to Cloudinary
    const base64Image = outputBuffer.toString("base64");

    const cloudinaryResult = await cloudinary.uploader.upload(
      `data:${mimeTypes[format]};base64,${base64Image}`,
      {
        folder: "image-compression-tool",
        public_id: `${Date.now()}-${crypto.randomUUID()}`,
        resource_type: "image",
        format
      }
    );

    // Return image and storage information
    res.set({
      "Content-Type": mimeTypes[format],
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Original-Size": String(originalSize),
      "X-Compressed-Size": String(compressedSize),
      "X-Savings-Percentage": String(savingsPercentage),
      "X-Cloudinary-URL": cloudinaryResult.secure_url,
      "X-Cloudinary-Public-ID": cloudinaryResult.public_id,
      "Access-Control-Expose-Headers":
        "Content-Disposition, X-Original-Size, X-Compressed-Size, X-Savings-Percentage, X-Cloudinary-URL, X-Cloudinary-Public-ID"
    });

    return res.send(outputBuffer);

  } catch (error) {
    console.error("Image processing error:", error);

    return res.status(400).json({
      success: false,
      message: "Image processing or cloud storage failed. Please try again."
    });
  }
};

module.exports = {
  compressImage
};
