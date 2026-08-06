const dns = require("dns");

// Force IPv4 resolution at the very start of the application
// This must be called before any modules that might do DNS lookups
dns.setDefaultResultOrder("ipv4first");

const dotenv = require("dotenv");

// Load environment variables BEFORE any module that uses them (e.g. db.js)
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const initializeDatabase = require("./config/init-db");

const app = express();

// Setup CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://kabbadesign.com.et",
  "https://www.kabbadesign.com.et",
  "https://checkout.chapa.co",
  "https://kabba-designs.vercel.app",
  "https://www.kabba-designs.vercel.app",
];

// Extra origins can be allowed without a code change, e.g.:
//   CORS_ORIGINS=https://my-store.vercel.app,https://admin.example.com
if (process.env.CORS_ORIGINS) {
  for (const origin of process.env.CORS_ORIGINS.split(",")) {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  }
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse incoming requests. The `verify` hook keeps the raw body so the
// Chapa webhook can verify its HMAC signature.
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));

// Routes
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products"); // ✅ use THIS instead of productRoutes.js
const eventRoutes = require("./routes/events");
const orderRoutes = require("./routes/orders");
const chapaRoutes = require("./routes/chapa");
const checkoutRoute = require("./checkout");
require("./cron");

// Route registration
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes); // ✅ this now includes PUT/DELETE/etc.
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chapa", chapaRoutes);
app.use("/", checkoutRoute); // includes POST /api/checkout

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to Kabba Designs API!");
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
}

startServer();