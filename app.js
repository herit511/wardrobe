require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const itemRoutes = require("./routes/itemRoutes");
const authRoutes = require("./routes/authRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow frontend (Vite dev server) to access the API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Wardrobe Backend Running" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler (must be AFTER routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});