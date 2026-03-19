const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');

const uploadEditorImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const result = await uploadBufferToCloudinary(req.file.buffer, 'blog-inline-images');
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('uploadEditorImage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadEditorImage };
