
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const imageRoutes = require("./routes/imageRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  exposedHeaders: [
    "Content-Disposition",
    "X-Original-Size",
    "X-Compressed-Size",
    "X-Savings-Percentage",
    "X-Cloudinary-URL",
    "X-Cloudinary-Public-ID"
  ]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Image Compression API is running!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Image Compression API"
  });
});

app.use("/api/images", imageRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Maximum image size is 20 MB."
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Maximum 20 images allowed."
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Something went wrong."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
