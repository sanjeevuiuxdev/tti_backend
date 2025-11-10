const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // blog URL (SEO)

    postedBy: { type: String, required: true }, // e.g. "Litesh Dhir"

    mainImage: {
      url: { type: String, required: true },     // Cloudinary URL
      public_id: { type: String, required: true } // for deleting later
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    // Rich text HTML from editor. We will just save the HTML string.
    contentHtml: { type: String, required: true },

    // SEO fields per blog
    metaTitle: { type: String },
    metaDescription: { type: String },

    // Optional extra fields in future (tags, published, etc.)
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
