const express = require("express");
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getSectionOptions, // NEW: return allowed homepage section tags
} = require("../controllers/blogController");

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

/**
 * PUBLIC
 * Supports query params:
 *   - ?section=<top_new|most_popular|editors_pick|latest_posts|highlights>
 *   - ?category=<category-slug>
 *   - ?limit=<number>   (max 50)
 */
router.get("/", getBlogs);
router.get("/sections", getSectionOptions); // NEW helper for admin UI dropdowns
router.get("/:slug", getBlogBySlug);

/**
 * ADMIN (multipart form-data)
 * mainImage field is handled by Multer.
 * For arrays like `sections`, send as JSON string in form-data and parse in controller.
 */
router.post("/", auth, upload.single("mainImage"), createBlog);
router.put("/:id", auth, upload.single("mainImage"), updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
