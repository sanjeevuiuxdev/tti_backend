// blog-backend/src/models/Comment.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// helpful indexes
CommentSchema.index({ post: 1, approved: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", CommentSchema);
