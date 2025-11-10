const multer = require("multer");

// Store file in memory so Cloudinary can read from buffer
const storage = multer.memoryStorage();

// Optional: basic filter to allow only images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

module.exports = upload;
