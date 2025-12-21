// controllers/blogController.js
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const Blog = require("../models/Blog");
const { SECTION_VALUES } = require("../models/Blog");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- helpers ----
function cleanSections(raw) {
  let arr = [];
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  } else if (Array.isArray(raw)) {
    arr = raw;
  }
  const allowed = new Set(SECTION_VALUES);
  return [...new Set((arr || []).filter(v => allowed.has(v)))];
}

function uploadBufferToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blog-main-images", resource_type: "image", ...opts },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ---------- PUBLIC ----------
exports.getBlogs = async (req, res) => {
  try {
    const { section, category, limit, published } = req.query;

    const q = {};
    if (section) q.sections = section;
    if (typeof published !== "undefined") q.published = published === "true";
    // If you later support `category` by slug, join Category here.

    const cursor = Blog.find(q)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    if (limit) cursor.limit(Math.min(Number(limit) || 0, 50));

    const rows = await cursor.lean();
    res.json(rows);
  } catch (err) {
    console.error("getBlogs error", err);
    res.status(500).json({ error: "Server error" });
  }
};

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

// Return allowed homepage section tags for admin dropdowns
exports.getSectionOptions = async (_req, res) => {
  const labelMap = {
    top_new:      "Top New",
    most_popular: "Most Popular",
    editors_pick: "Editor Pick's",
    latest_posts: "Latest Posts",
    highlights:   "Highlights",
    banner: "Banner",
  };
  res.json(SECTION_VALUES.map(v => ({ value: v, label: labelMap[v] || v })));
};

// ---------- ADMIN ----------
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
      sections,
      schemaMarkup, 
      tags
      
    } = req.body;

    if (!title || !postedBy || !categoryId || !contentHtml) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "mainImage file is required" });
    }

    // Upload image from memory buffer
    const upload = await uploadBufferToCloudinary(req.file.buffer);

    const doc = await Blog.create({
      title,
      postedBy,
      category: categoryId,
      contentHtml,
      metaTitle,
      metaDescription,
      published: published !== "false",
      sections: cleanSections(sections),
      mainImage: { url: upload.secure_url, public_id: upload.public_id },
      schemaMarkup: typeof schemaMarkup === "string" ? schemaMarkup.trim() : "",
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("createBlog error", err);
    // Bubble Cloudinary error message if present
    const msg = err?.message || "Server error";
    res.status(err.http_code || 500).json({ error: msg });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const set = {};
    // const fields = ["title", "postedBy", "contentHtml", "metaTitle", "metaDescription"];
    const fields = ["title", "postedBy", "contentHtml", "metaTitle", "metaDescription", "schemaMarkup"];
    fields.forEach((f) => {
      if (typeof req.body[f] !== "undefined") set[f] = req.body[f];
    });
    if (typeof req.body.categoryId !== "undefined") set.category = req.body.categoryId;
    if (typeof req.body.published !== "undefined") set.published = req.body.published === "true";
    if (typeof req.body.sections !== "undefined") set.sections = cleanSections(req.body.sections);

    // If new image provided, replace on Cloudinary
    if (req.file && req.file.buffer) {
      const current = await Blog.findById(id).select("mainImage.public_id");
      if (!current) return res.status(404).json({ error: "Not found" });

      if (current.mainImage?.public_id) {
        try { await cloudinary.uploader.destroy(current.mainImage.public_id); } catch {}
      }

      const up = await uploadBufferToCloudinary(req.file.buffer);
      set.mainImage = { url: up.secure_url, public_id: up.public_id };
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateBlog error", err);
    const msg = err?.message || "Server error";
    res.status(err.http_code || 500).json({ error: msg });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Blog.findById(id).select("mainImage.public_id");
    if (!row) return res.status(404).json({ error: "Not found" });

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
