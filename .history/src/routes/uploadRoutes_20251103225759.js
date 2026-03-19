const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadEditorImage } = require('../controllers/uploadController');

// Admin-only; the rich text editor will hit this to store images and get a URL back
router.post('/image', auth, upload.single('image'), uploadEditorImage);

module.exports = router;
