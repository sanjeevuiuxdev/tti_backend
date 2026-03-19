// routes/blogRoutes.js
const express = require("express");
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getSectionOptions,
  getPopularTags, // ✅ added
} = require("../controllers/blogController");

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// PUBLIC
router.get("/", getBlogs);
router.get("/sections", getSectionOptions); // ✅ for admin dropdowns
router.get("/:slug", getBlogBySlug);
router.get("/popular", getPopularTags);

// ADMIN (multipart)
router.post("/", auth, upload.single("mainImage"), createBlog);
router.put("/:id", auth, upload.single("mainImage"), updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
