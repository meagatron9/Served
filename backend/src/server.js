// src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const postsRouter = require("./routes/posts");
const { testConnection } = require("./db/pool");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Simple health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Posts routes
app.use("/api/posts", postsRouter);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  await testConnection();
});
