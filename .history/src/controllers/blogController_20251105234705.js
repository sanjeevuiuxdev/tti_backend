// controllers/blogController.js
const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const Blog = require("../models/Blog");
const { SECTION_VALUES } = require("../models/Blog");

// --- Cloudinary init (uses your existing .env) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- small helper: keep only allowed section values ---
function cleanSections(raw) {
  // raw can be JSON string, array, or undefined
  let arr = [];
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  } else if (Array.isArray(raw)) {
    arr = raw;
  }
  const allowed = new Set(SECTION_VALUES);
  return [...new Set((arr || []).filter(v => allowed.has(v)))];
}

// GET /api/blogs  (optionally filter by ?section= & limit= & published=)
exports.getBlogs = async (req, res) => {
  try {
    const { section, limit, published } = req.query;

    const q = {};
    if (section) q.sections = section;
    if (typeof published !== "undefined") q.published = published === "true";

    const cursor = Blog.find(q)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    if (limit) cursor.limit(Number(limit));

    const rows = await cursor.lean();
    res.json(rows);
  } catch (err) {
    console.error("getBlogs error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const row = await Blog.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .lean();

    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("getBlogBySlug error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/blogs  (auth + upload.single('mainImage'))
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      postedBy,
      categoryId,
      contentHtml,
      metaTitle,
      metaDescription,
      published,
      sections, // JSON string from form
    } = req.body;

    if (!title || !postedBy || !categoryId || !contentHtml) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "mainImage file is required" });
    }

    // upload main image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "blog-main-images",
      overwrite: true,
    });

    // clean up local temp file
    try { fs.unlinkSync(req.file.path); } catch {}

    const doc = await Blog.create({
      title,
      postedBy,
      category: categoryId,
      contentHtml,
      metaTitle,
      metaDescription,
      published: published !== "false", // default true unless explicitly "false"
      sections: cleanSections(sections),

      mainImage: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("createBlog error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/blogs/:id  (auth + upload.single('mainImage'))
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // fields allowed to update
    const set = {};
    const fields = [
      "title",
      "postedBy",
      "contentHtml",
      "metaTitle",
      "metaDescription",
    ];
    fields.forEach((f) => {
      if (typeof req.body[f] !== "undefined") set[f] = req.body[f];
    });

    if (typeof req.body.categoryId !== "undefined") {
      set.category = req.body.categoryId;
    }
    if (typeof req.body.published !== "undefined") {
      set.published = req.body.published === "true";
    }
    if (typeof req.body.sections !== "undefined") {
      set.sections = cleanSections(req.body.sections);
    }

    // if a new main image was uploaded, replace on Cloudinary
    if (req.file) {
      const current = await Blog.findById(id).select("mainImage.public_id");
      if (!current) return res.status(404).json({ error: "Not found" });

      // delete old if present
      if (current.mainImage?.public_id) {
        try { await cloudinary.uploader.destroy(current.mainImage.public_id); } catch {}
      }

      const up = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog-main-images",
        overwrite: true,
      });
      try { fs.unlinkSync(req.file.path); } catch {}

      set.mainImage = { url: up.secure_url, public_id: up.public_id };
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: true } // <- keep enum validation for sections
    )
      .populate("category", "name slug");

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateBlog error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Blog.findById(id).select("mainImage.public_id");
    if (!row) return res.status(404).json({ error: "Not found" });

    // best-effort delete from Cloudinary
    if (row.mainImage?.public_id) {
      try { await cloudinary.uploader.destroy(row.mainImage.public_id); } catch {}
    }

    await Blog.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteBlog error", err);
    res.status(500).json({ error: "Server error" });
  }
};
