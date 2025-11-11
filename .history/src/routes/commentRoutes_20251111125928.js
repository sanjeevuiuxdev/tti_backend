// blog-backend/src/routes/commentRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
// const c = require("../controllers/commentController");

const router = require("express").Router();
const ctrl = require("../controllers/commentController");


// Public
// const publicRouter = express.Router();
// publicRouter.post("/", c.createPublic);
// publicRouter.get("/", c.listPublic);
router.get("/", ctrl.listPublic);
router.post("/", ctrl.createPublic);

// Admin
const adminRouter = express.Router();
adminRouter.get("/", auth, ctrl.listAdmin);
adminRouter.put("/:id/approve", auth, ct.approve);
adminRouter.delete("/:id", auth, ctrl.remove);

module.exports = { publicRouter, adminRouter };
