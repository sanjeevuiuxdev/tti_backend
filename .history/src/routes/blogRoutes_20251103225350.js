const express = require('express');
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

const authMiddleware = require('../middleware/authMiddleware');

// public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// admin only
router.post('/', authMiddleware, createBlog);
router.put('/:id', authMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;
