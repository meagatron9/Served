// src/controllers/postsController.js
const { pool } = require("../db/pool");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-pro"

// POST /api/posts
// body: { user_id, description, image_url }
async function createPost(req, res) {
  const { user_id, description, image_url } = req.body;

  if (!user_id || !description) {
    return res
      .status(400)
      .json({ error: "user_id and description are required" });
  }

  try {
    // 1. Insert post into DB
    const postResult = await pool.query(
      `
      INSERT INTO posts (user_id, description, image_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [user_id, description, image_url || null]
    );

    const post = postResult.rows[0];

    // 2. Build prompt for Gemini
    const prompt = `
      You are a nutrition analysis assistant.

      Analyze this meal based on the user's description.
      If an image URL is provided, assume it visually matches the description.

      Description: "${description}"
      Image URL (may be null): ${image_url || "none"}

      Please respond in clear paragraphs, covered in this order:
      1) Estimated calories range
      2) Rough macro breakdown (carbs/protein/fat)
      3) Key vitamins/minerals likely present
      4) Healthiness rating from 1–10
      5) 2–3 concrete suggestions to improve the nutritional balance

      Keep it under 250 words.
    `;

    // 3. Call Gemini
    let aiSummary = null;
    try {
      const result = await model.generateContent(prompt);
      aiSummary = result.response.text();
    } catch (aiErr) {
      console.error("Gemini error:", aiErr?.message || aiErr);
      aiSummary = "AI nutrition analysis is temporarily unavailable.";
    }

    // 4. Store AI analysis in nutrition_analysis table
    const analysisResult = await pool.query(
      `
      INSERT INTO nutrition_analysis (post_id, ai_summary)
      VALUES ($1, $2)
      RETURNING *
    `,
      [post.id, aiSummary]
    );

    const analysis = analysisResult.rows[0];

    // 5. Return combined data
    return res.status(201).json({
      success: true,
      post,
      nutrition_analysis: analysis,
    });
  } catch (err) {
    console.error("createPost error:", err.message);
    return res.status(500).json({ error: "Server error creating post" });
  }
}

// GET /api/posts
// Returns posts with joined nutrition_analysis
async function getAllPosts(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.user_id,
        p.description,
        p.image_url,
        p.created_at,
        n.ai_summary
      FROM posts p
      LEFT JOIN nutrition_analysis n
        ON n.post_id = p.id
      ORDER BY p.created_at DESC;
    `
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("getAllPosts error:", err.message);
    return res.status(500).json({ error: "Server error fetching posts" });
  }
}

module.exports = {
  createPost,
  getAllPosts,
};
