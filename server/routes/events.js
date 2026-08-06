const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const { addEvent, getEvents } = require("../controllers/eventController");

// Keep uploads in memory — files are streamed straight to Vercel Blob.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

router.get("/", getEvents);
router.post("/", verifyToken, upload.single("image"), addEvent);

module.exports = router;
