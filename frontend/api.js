// frontend/api.js
const API_URL = "http://localhost:5000/api";

export async function createPost(postData) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: 1,                 // temp hard-coded user
      description: postData.title,
      image_url: postData.photo,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Create post failed:", res.status, text);
    throw new Error("Failed to create post");
  }

  return res.json();
}

export async function getAllPosts() {
  const res = await fetch(`${API_URL}/posts`);

  if (!res.ok) {
    const text = await res.text();
    console.error("Get posts failed:", res.status, text);
    throw new Error("Failed to load posts");
  }

  return res.json();
}
