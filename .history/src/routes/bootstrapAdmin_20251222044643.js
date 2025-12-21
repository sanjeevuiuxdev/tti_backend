// routes/bootstrapAdmin.js
const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

router.post("/bootstrap-admin", async (req, res) => {
  // simple protection
  if (req.headers["x-bootstrap-key"] !== process.env.BOOTSTRAP_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const username = "ashu";
  const email = "admin@gmail.com";
  const password = "TTI_Ashu@12345";

  let admin = await Admin.findOne({ $or: [{ username }, { email }] });

  if (!admin) {
    admin = new Admin({
      username,
      email,
      passwordHash: "temp",
    });
  }

  await admin.setPassword(password);
  await admin.save();

  res.json({ success: true });
});

module.exports = router;
