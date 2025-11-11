// blog-backend/src/routes/commentRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/commentController");

// Public routes
const publicRouter = express.Router();
publicRouter.get("/", ctrl.listPublic);
publicRouter.post("/", ctrl.createPublic);

// Admin routes
const adminRouter = express.Router();
adminRouter.get("/", auth, ctrl.listAdmin);
adminRouter.put("/:id/approve", auth, ctrl.approve);
adminRouter.delete("/:id", auth, ctrl.remove);

module.exports = { publicRouter, adminRouter };


23§