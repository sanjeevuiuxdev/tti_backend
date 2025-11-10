const express = require('express');
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// admin (multipart)
router.post('/', auth, upload.single('mainImage'), createBlog);
router.put('/:id', auth, upload.single('mainImage'), updateBlog);
router.delete('/:id', auth, deleteBlog);

module.exports = router;
