// blog-backend/src/controllers/commentController.js
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// -------- PUBLIC --------

const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

// POST /api/comments
// body: { postId, name, email, message }
// exports.createPublic = async (req, res) => {
//   try {
//     const { postId, name, email, message } = req.body || {};
//     if (!postId || !name || !email || !message) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // sanity: make sure blog exists
//     const exists = await Blog.findById(postId).lean();
//     if (!exists) return res.status(404).json({ error: "Post not found" });

//     const comment = await Comment.create({ post: postId, name, email, message });
//     res.status(201).json({ ok: true, id: comment._id });
//   } catch (err) {
//     console.error("createPublic comment error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


exports.createPublic = async (req, res) => {
  try {
    // Log once to see what actually arrives
    console.log("POST /api/comments body:", req.body);

    // Accept either postId or post (client/older code compatibility)
    const rawPostId = req.body?.postId ?? req.body?.post;
    const name = (req.body?.name || "").trim();
    const email = (req.body?.email || "").trim();
    const message = (req.body?.message || "").trim();

    if (!rawPostId || !isNonEmpty(name) || !isNonEmpty(email) || !isNonEmpty(message)) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          postId: Boolean(rawPostId),
          name: isNonEmpty(name),
          email: isNonEmpty(email),
          message: isNonEmpty(message),
        },
      });
    }

    if (!mongoose.isValidObjectId(rawPostId)) {
      return res.status(400).json({ error: "Invalid postId" });
    }

    // sanity: post must exist
    const post = await Blog.findById(rawPostId).select("_id").lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    await Comment.create({
      post: rawPostId,
      name,
      email,
      message,
    });

    return res.status(201).json({ ok: true, message: "Saved; pending approval." });
  } catch (err) {
    console.error("createPublic comment error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/comments?postId=...  (approved only)
// exports.listPublic = async (req, res) => {
//   try {
//     const { postId } = req.query;
//     if (!postId) return res.status(400).json({ error: "postId required" });

//     const rows = await Comment.find({ post: postId, approved: true })
//       .sort({ createdAt: 1 })
//       .lean();
//     res.json(rows);
//   } catch (err) {
//     console.error("listPublic comments error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


exports.listPublic = async (req, res) => {
  try {
    const rawPostId = req.query?.postId ?? req.query?.post;
    if (!rawPostId) return res.status(400).json({ error: "postId required" });
    if (!mongoose.isValidObjectId(rawPostId)) {
      return res.status(400).json({ error: "Invalid postId" });
    }

    const rows = await Comment.find({ post: rawPostId, approved: true })
      .sort({ createdAt: 1 })
      .lean();

    return res.json(rows);
  } catch (err) {
    console.error("listPublic comments error", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// -------- ADMIN --------

// GET /api/admin/comments?postId=...&approved=true|false (optional filters)
exports.listAdmin = async (req, res) => {
  try {
    const { postId, approved } = req.query;
    const q = {};
    if (postId) q.post = postId;
    if (typeof approved !== "undefined") q.approved = approved === "true";

    const rows = await Comment.find(q)
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
      .lean();

    res.json(rows);
  } catch (err) {
    console.error("listAdmin comments error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/admin/comments/:id/approve
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Comment.findByIdAndUpdate(
      id,
      { $set: { approved: true } },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("approve comment error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/admin/comments/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Comment.findByIdAndDelete(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("delete comment error", err);
    res.status(500).json({ error: "Server error" });
  }
};
