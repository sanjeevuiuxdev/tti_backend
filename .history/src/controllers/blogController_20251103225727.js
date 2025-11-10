const Blog = require('../models/Blog');
const generateSlug = require('../utils/generateSlug');
const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');
const cloudinary = require('../config/cloudinary');

// POST /api/blogs (multipart/form-data)
// fields: title, postedBy, contentHtml, categoryId, metaTitle, metaDescription, published
// file: mainImage
const createBlog = async (req, res) => {
  try {
    const {
      title,
      postedBy,
      contentHtml,
      categoryId,
      metaTitle,
      metaDescription,
      published
    } = req.body;

    if (!title || !postedBy || !contentHtml || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Main image is required' });
    }

    const uploadRes = await uploadBufferToCloudinary(req.file.buffer, 'blog-main-images');
    const slug = generateSlug(title);

    const blog = await Blog.create({
      title,
      slug,
      postedBy,
      contentHtml,
      category: categoryId,
      metaTitle,
      metaDescription,
      published: published !== undefined ? published : true,
      mainImage: {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id
      }
    });

    res.json(blog);
  } catch (err) {
    console.error('createBlog error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/blogs (public)
const getBlogs = async (req, res) => {
  const blogs = await Blog.find({ published: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  res.json(blogs);
};

// GET /api/blogs/:slug (public)
const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, published: true })
    .populate('category', 'name slug');
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(blog);
};

// PUT /api/blogs/:id (multipart/form-data)
// optional file: mainImage
const updateBlog = async (req, res) => {
  try {
    const {
      title,
      postedBy,
      contentHtml,
      categoryId,
      metaTitle,
      metaDescription,
      published
    } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // if new image uploaded, replace
    if (req.file) {
      if (blog.mainImage && blog.mainImage.public_id) {
        await cloudinary.uploader.destroy(blog.mainImage.public_id);
      }
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, 'blog-main-images');
      blog.mainImage = {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id
      };
    }

    if (title) {
      blog.title = title;
      blog.slug = generateSlug(title);
    }
    if (postedBy) blog.postedBy = postedBy;
    if (contentHtml) blog.contentHtml = contentHtml;
    if (categoryId) blog.category = categoryId;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (published !== undefined) blog.published = published === 'true' || published === true;

    const updated = await blog.save();
    res.json(updated);
  } catch (err) {
    console.error('updateBlog error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.mainImage?.public_id) {
      await cloudinary.uploader.destroy(blog.mainImage.public_id);
    }

    await blog.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteBlog error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog
};
