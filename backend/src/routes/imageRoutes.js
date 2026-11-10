
const express = require("express");
const router = express.Router();

// Import upload middleware
const upload = require("../middleware/upload");

// Import image controller
const {
  compressImage
} = require("../controllers/imageController");

// POST route for image compression
router.post(
  "/compress",
  upload.single("image"),
  compressImage
);

module.exports = router;
