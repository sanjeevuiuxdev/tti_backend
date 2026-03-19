const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true }, // for SEO URLs
    metaTitle: { type: String },        // SEO
    metaDescription: { type: String },  // SEO
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
