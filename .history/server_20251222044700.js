// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { publicRouter: commentPublic, adminRouter: commentAdmin } = require("./src/routes/commentRoutes");



dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();

// middlewares
app.use(cors()); // allow frontend to hit backend
app.use(express.json({ limit: '10mb' })); // for json / rich text body
app.use(express.urlencoded({ extended: true }));

// connect DB
connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/uploads', uploadRoutes);

app.use("/api/contact", require("./src/routes/contactRoutes"));

app.use("/api/comments", commentPublic);
app.use("/api/admin/comments", commentAdmin);
app.use("/api/internal", require("./routes/bootstrapAdmin"));


// health check
app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
