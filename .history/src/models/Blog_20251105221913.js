const mongoose = require("mongoose");
const slugify = require("slugify");

const SECTION_VALUES = [
  "top_new",        // 1
  "most_popular",   // 2
  "editors_pick",   // 3
  "latest_posts",   // 4
  "highlights",     // 5
];

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    slug: { type: String, required: true, unique: true },

    postedBy: { type: String, required: true },

    mainImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    contentHtml: { type: String, required: true },

    metaTitle: { type: String },
    metaDescription: { type: String },

    published: { type: Boolean, default: true },

    // ✅ New field for homepage sections
    sections: {
      type: [String],
      enum: SECTION_VALUES,
      default: [],
    },
  },
  { timestamps: true }
);

// auto-generate slug from title if not provided
BlogSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// index for fast sorting and section queries
BlogSchema.index({ sections: 1, createdAt: -1 });

module.exports = mongoose.model("Blog", BlogSchema);
module.exports.SECTION_VALUES = SECTION_VALUES;
