// blog-backend/src/routes/commentRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/commentController");


// Public
const publicRouter = express.Router();
publicRouter.post("/", c.createPublic);
publicRouter.get("/", c.listPublic);

// Admin
const adminRouter = express.Router();
adminRouter.get("/", auth, c.listAdmin);
adminRouter.put("/:id/approve", auth, c.approve);
adminRouter.delete("/:id", auth, c.remove);

module.exports = { publicRouter, adminRouter };
