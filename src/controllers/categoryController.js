const Category = require('../models/Category');
const generateSlug = require('../utils/generateSlug');

// POST /api/categories
// body: { name, metaTitle, metaDescription }
const createCategory = async (req, res) => {
  try {
    const { name, metaTitle, metaDescription } = req.body;

    const slug = generateSlug(name);

    const category = await Category.create({
      name,
      slug,
      metaTitle,
      metaDescription,
    });

    res.json(category);
  } catch (err) {
    console.error('createCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/categories
const getCategories = async (req, res) => {
  const cats = await Category.find().sort({ createdAt: -1 });
  res.json(cats);
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, metaTitle, metaDescription } = req.body;

    const slug = name ? generateSlug(name) : undefined;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(metaTitle && { metaTitle }),
        ...(metaDescription && { metaDescription }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('updateCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
