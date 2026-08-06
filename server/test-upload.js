const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://kabba-designs-server.onrender.com/api";
const ADMIN_EMAIL = "admin@kabba.com";
const ADMIN_PASSWORD = "kabba123";

async function testUpload() {
  // Login
  console.log("Logging in...");
  const loginRes = await axios.post(`${BASE_URL}/admin/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const token = loginRes.data.token;
  console.log("Got token:", token.substring(0, 20) + "...");

  // Create a tiny 1x1 pixel JPEG file in memory
  const tinyImage = Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAEADABEAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkCAAv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP0VAAABAAEA")
  .toString("base64");

  // Write tiny image to temp file
  const tempFile = path.join(__dirname, "test-product.jpg");
  fs.writeFileSync(tempFile, tinyImage, "base64");
  console.log("Created temp image file:", fs.statSync(tempFile).size, "bytes");

  // Prepare form data
  const form = new FormData();
  form.append("name", "Test Product");
  form.append("price_birr", 100);
  form.append("price_dollar", 2);
  form.append("quantity", 10);
  form.append("description", "Test description");
  form.append("category", "Women");
  form.append("images", fs.createReadStream(tempFile));

  console.log("Uploading test product...");
  try {
    const res = await axios.post(`${BASE_URL}/products`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000,
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("FAILED:");
    console.error("Status:", err.response?.status);
    console.error("Error:", err.response?.data);
    console.error("Full error:", err.message);
  } finally {
    try { fs.unlinkSync(tempFile); } catch {}
  }
}

testUpload().catch(console.error);