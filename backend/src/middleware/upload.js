
const multer = require("multer");

// Allowed image formats
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
];

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Validate uploaded file type
const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP and AVIF are allowed."
      )
    );
  }

  callback(null, true);
};

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB per image
    files: 20                  // Maximum 20 images
  }
});

module.exports = upload;
