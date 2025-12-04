// src/routes/posts.js
const express = require("express");
const { createPost, getAllPosts } = require("../controllers/postsController");

const router = express.Router();

// /api/posts
router.get("/", getAllPosts);
router.post("/", createPost);

module.exports = router;
