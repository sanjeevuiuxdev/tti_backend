const mongoose = require("mongoose");
const slugify = require("slugify");

const SECTION_VALUES = [
  "top_new",
  "most_popular",
  "editors_pick",
  "latest_posts",
  "highlights",
  "banner",            
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
    sections: {
      type: [String],
      enum: SECTION_VALUES,
      default: [],
    },
  },
  { timestamps: true }
);

BlogSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

BlogSchema.index({ sections: 1, createdAt: -1 });

module.exports = mongoose.model("Blog", BlogSchema);
module.exports.SECTION_VALUES = SECTION_VALUES;
