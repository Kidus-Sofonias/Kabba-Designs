const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://kabba-designs-server.onrender.com/api";
const ADMIN_EMAIL = "admin@kabba.com";
const ADMIN_PASSWORD = "kabba123";
const DOWNLOAD_DIR = path.join(__dirname, "tmp-seed-images");

// Helper to generate reliable image URLs using picsum.photos
function getProductImage(seed, width = 600, height = 800) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

function getEventImage(seed) {
  return `https://picsum.photos/seed/${seed}/800/500`;
}

// ─── PRODUCT CATALOG ─────────────────────────────────────────────────────────
const products = [
  // ── WOMEN ──
  {
    name: "Elegant Floral Maxi Dress",
    price_birr: 2500,
    price_dollar: 45,
    quantity: 30,
    description: "A beautiful floral maxi dress perfect for summer outings and casual elegance. Lightweight fabric with a flattering A-line cut.",
    category: "Women",
    imageUrls: [
      getProductImage("dress1"),
      getProductImage("dress2"),
      getProductImage("dress3")
    ],
    variants: [
      { name: "Small", quantity: 10 },
      { name: "Medium", quantity: 12 },
      { name: "Large", quantity: 8 }
    ]
  },
  {
    name: "Classic Black Blazer",
    price_birr: 3500,
    price_dollar: 65,
    quantity: 20,
    description: "Timeless black blazer tailored for a sophisticated look. Ideal for office wear or formal events.",
    category: "Women",
    imageUrls: [
      getProductImage("blazer1"),
      getProductImage("blazer2")
    ],
    variants: [
      { name: "Small", quantity: 7 },
      { name: "Medium", quantity: 8 },
      { name: "Large", quantity: 5 }
    ]
  },
  {
    name: "Summer Boho Wrap Dress",
    price_birr: 1800,
    price_dollar: 32,
    quantity: 25,
    description: "Lightweight boho wrap dress with playful patterns. Perfect for vacation and weekend brunches.",
    category: "Women",
    imageUrls: [
      getProductImage("boho1"),
      getProductImage("boho2")
    ],
    variants: [
      { name: "Small", quantity: 10 },
      { name: "Medium", quantity: 10 },
      { name: "Large", quantity: 5 }
    ]
  },
  {
    name: "Leather Ankle Boots",
    price_birr: 4200,
    price_dollar: 78,
    quantity: 15,
    description: "Genuine leather ankle boots with a comfortable block heel. Pairs perfectly with jeans or dresses.",
    category: "Women",
    imageUrls: [
      getProductImage("boots1"),
      getProductImage("boots2")
    ],
    variants: [
      { name: "Size 37", quantity: 5 },
      { name: "Size 38", quantity: 5 },
      { name: "Size 39", quantity: 5 }
    ]
  },
  {
    name: "Cashmere Knit Sweater",
    price_birr: 3200,
    price_dollar: 58,
    quantity: 18,
    description: "Luxuriously soft cashmere sweater in cream. A winter wardrobe essential that combines warmth with elegance.",
    category: "Women",
    imageUrls: [
      getProductImage("sweater1"),
      getProductImage("sweater2")
    ],
    variants: [
      { name: "Small", quantity: 6 },
      { name: "Medium", quantity: 7 },
      { name: "Large", quantity: 5 }
    ]
  },

  // ── MEN ──
  {
    name: "Slim Fit Navy Suit",
    price_birr: 8500,
    price_dollar: 155,
    quantity: 10,
    description: "Premium navy blue slim-fit suit. Tailored cut with a modern silhouette. Includes jacket and trousers.",
    category: "Men",
    imageUrls: [
      getProductImage("suit1"),
      getProductImage("suit2")
    ],
    variants: [
      { name: "Size 48", quantity: 3 },
      { name: "Size 50", quantity: 4 },
      { name: "Size 52", quantity: 3 }
    ]
  },
  {
    name: "Casual Linen Shirt",
    price_birr: 1500,
    price_dollar: 28,
    quantity: 40,
    description: "Breathable linen shirt in light blue. Perfect for warm weather and casual Fridays.",
    category: "Men",
    imageUrls: [
      getProductImage("shirt1"),
      getProductImage("shirt2")
    ],
    variants: [
      { name: "Small", quantity: 12 },
      { name: "Medium", quantity: 15 },
      { name: "Large", quantity: 13 }
    ]
  },
  {
    name: "Leather Oxford Shoes",
    price_birr: 5500,
    price_dollar: 100,
    quantity: 12,
    description: "Classic brown Oxford shoes crafted from genuine leather. Hand-finished with a durable sole.",
    category: "Men",
    imageUrls: [
      getProductImage("shoes1"),
      getProductImage("shoes2")
    ],
    variants: [
      { name: "Size 41", quantity: 3 },
      { name: "Size 42", quantity: 5 },
      { name: "Size 43", quantity: 4 }
    ]
  },
  {
    name: "Wool Blend Peacoat",
    price_birr: 5800,
    price_dollar: 105,
    quantity: 8,
    description: "Double-breasted wool peacoat in charcoal. Classic military-inspired styling with modern tailoring.",
    category: "Men",
    imageUrls: [
      getProductImage("coat1"),
      getProductImage("coat2")
    ],
    variants: [
      { name: "Medium", quantity: 3 },
      { name: "Large", quantity: 3 },
      { name: "XL", quantity: 2 }
    ]
  },
  {
    name: "Cotton Chino Pants",
    price_birr: 2200,
    price_dollar: 40,
    quantity: 35,
    description: "Comfortable stretch cotton chinos in khaki. Smart-casual staple that pairs with anything.",
    category: "Men",
    imageUrls: [
      getProductImage("chinos1"),
      getProductImage("chinos2")
    ],
    variants: [
      { name: "Size 30", quantity: 10 },
      { name: "Size 32", quantity: 12 },
      { name: "Size 34", quantity: 13 }
    ]
  },

  // ── JEWELRY ──
  {
    name: "Gold Chain Necklace",
    price_birr: 12000,
    price_dollar: 220,
    quantity: 5,
    description: "Elegant 18K gold chain necklace with a minimalist pendant. Timeless piece for any occasion.",
    category: "Jewelry",
    imageUrls: [
      getProductImage("necklace1"),
      getProductImage("necklace2", 600, 600)
    ],
    variants: []
  },
  {
    name: "Pearl Drop Earrings",
    price_birr: 4500,
    price_dollar: 82,
    quantity: 8,
    description: "Freshwater pearl drop earrings with sterling silver settings. Elegant and timeless.",
    category: "Jewelry",
    imageUrls: [
      getProductImage("earrings1", 600, 600),
      getProductImage("earrings2", 600, 600)
    ],
    variants: []
  },
  {
    name: "Silver Bangle Set",
    price_birr: 3200,
    price_dollar: 58,
    quantity: 12,
    description: "Set of three sterling silver bangles with subtle hammered texture. Stackable and versatile.",
    category: "Jewelry",
    imageUrls: [
      getProductImage("bangle1", 600, 600),
      getProductImage("bangle2", 600, 600)
    ],
    variants: []
  },
  {
    name: "Diamond Stud Earrings",
    price_birr: 25000,
    price_dollar: 455,
    quantity: 3,
    description: "Brilliant-cut diamond stud earrings set in 18K white gold. Classic luxury that never goes out of style.",
    category: "Jewelry",
    imageUrls: [
      getProductImage("diamond1", 600, 600),
      getProductImage("diamond2", 600, 600)
    ],
    variants: []
  },
  {
    name: "Leather Wrap Bracelet",
    price_birr: 1200,
    price_dollar: 22,
    quantity: 20,
    description: "Handcrafted leather wrap bracelet with brass accents. Casual and stylish accessory.",
    category: "Jewelry",
    imageUrls: [
      getProductImage("bracelet1", 600, 600),
      getProductImage("bracelet2", 600, 600)
    ],
    variants: []
  },

  // ── CHILDREN ──
  {
    name: "Kids Colorful Raincoat",
    price_birr: 1500,
    price_dollar: 28,
    quantity: 25,
    description: "Bright and cheerful raincoat with fun animal prints. Waterproof and lightweight for active kids.",
    category: "Children",
    imageUrls: [
      getProductImage("kids1"),
      getProductImage("kids2")
    ],
    variants: [
      { name: "Age 3-4", quantity: 8 },
      { name: "Age 5-6", quantity: 9 },
      { name: "Age 7-8", quantity: 8 }
    ]
  },
  {
    name: "Denim Dungaree Set",
    price_birr: 1800,
    price_dollar: 33,
    quantity: 20,
    description: "Adorable denim dungaree set with adjustable straps. Comfortable cotton blend for all-day play.",
    category: "Children",
    imageUrls: [
      getProductImage("dungaree1"),
      getProductImage("dungaree2")
    ],
    variants: [
      { name: "Age 2-3", quantity: 7 },
      { name: "Age 4-5", quantity: 7 },
      { name: "Age 6-7", quantity: 6 }
    ]
  },
  {
    name: "Girls Tutu Party Dress",
    price_birr: 2200,
    price_dollar: 40,
    quantity: 15,
    description: "Magical tulle tutu dress with sparkly details. Perfect for birthdays and special occasions.",
    category: "Children",
    imageUrls: [
      getProductImage("tutu1"),
      getProductImage("tutu2")
    ],
    variants: [
      { name: "Age 3-4", quantity: 5 },
      { name: "Age 5-6", quantity: 5 },
      { name: "Age 7-8", quantity: 5 }
    ]
  },
  {
    name: "Boys Graphic T-Shirt Pack",
    price_birr: 1200,
    price_dollar: 22,
    quantity: 40,
    description: "Pack of 3 fun graphic t-shirts with dinosaur, space and superhero designs. Soft 100% cotton.",
    category: "Children",
    imageUrls: [
      getProductImage("tshirt1"),
      getProductImage("tshirt2")
    ],
    variants: [
      { name: "Age 4-5", quantity: 14 },
      { name: "Age 6-7", quantity: 14 },
      { name: "Age 8-9", quantity: 12 }
    ]
  },
  {
    name: "Baby Soft Cotton Romper",
    price_birr: 900,
    price_dollar: 16,
    quantity: 30,
    description: "Ultra-soft organic cotton romper with snap buttons. Gentle on baby's skin with adorable prints.",
    category: "Children",
    imageUrls: [
      getProductImage("romper1"),
      getProductImage("romper2")
    ],
    variants: [
      { name: "0-6 months", quantity: 10 },
      { name: "6-12 months", quantity: 10 },
      { name: "12-18 months", quantity: 10 }
    ]
  },
];

// ─── EVENTS ───────────────────────────────────────────────────────────────────
const events = [
  {
    name: "Addis Fashion Week 2026",
    start_date: "2026-08-15",
    end_date: "2026-08-20",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("fashionweek")
  },
  {
    name: "Ethiopian Designers Exhibition",
    start_date: "2026-09-10",
    end_date: "2026-09-12",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("exhibition")
  },
  {
    name: "Modern African Art & Fashion Show",
    start_date: "2026-10-05",
    end_date: "2026-10-07",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("artfashion")
  },
  {
    name: "Children's Summer Festival",
    start_date: "2026-07-20",
    end_date: "2026-07-22",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("kidsfestival")
  },
  {
    name: "Jewelry & Gemstone Expo Addis",
    start_date: "2026-11-01",
    end_date: "2026-11-03",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("jewelryexpo")
  },
  {
    name: "Holiday Fashion Bazaar",
    start_date: "2026-12-15",
    end_date: "2026-12-24",
    location_link: "https://maps.app.goo.gl/skQZcHjHGKQFKS2n8",
    imageUrl: getEventImage("bazaar")
  }
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, filepath) {
  const response = await axios({ url, responseType: "stream", timeout: 30000 });
  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function login() {
  const res = await axios.post(`${BASE_URL}/admin/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  console.log("✅ Logged in as admin");
  return res.data.token;
}

async function uploadProduct(token, product) {
  console.log(`\n📦 Uploading product: ${product.name}...`);

  const form = new FormData();
  form.append("name", product.name);
  form.append("price_birr", product.price_birr);
  form.append("price_dollar", product.price_dollar);
  form.append("quantity", product.quantity);
  form.append("description", product.description);
  form.append("category", product.category);

  // Download and attach images
  const imagePaths = [];
  for (let i = 0; i < product.imageUrls.length; i++) {
    const url = product.imageUrls[i];
    console.log(`   Downloading image ${i + 1}/${product.imageUrls.length}: ${url}`);
    const ext = ".jpg";
    const filepath = path.join(DOWNLOAD_DIR, `${Date.now()}-${i}${ext}`);
    await downloadImage(url, filepath);
    const stats = fs.statSync(filepath);
    console.log(`   Downloaded: ${(stats.size / 1024).toFixed(1)} KB`);
    imagePaths.push(filepath);
    form.append("images", fs.createReadStream(filepath));
  }

  // Attach variants as JSON string
  form.append("variants", JSON.stringify(product.variants));

  try {
    console.log(`   Uploading to server...`);
    const res = await axios.post(`${BASE_URL}/products`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000,
    });
    console.log(`   ✅ Uploaded: ${product.name} (ID: ${res.data.id})`);
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    console.error(`   ❌ Failed: ${product.name} - ${errorMsg}`);
    return null;
  } finally {
    // Clean up temp files
    for (const fp of imagePaths) {
      try { fs.unlinkSync(fp); } catch {}
    }
  }
}

async function uploadEvent(token, event) {
  console.log(`\n📅 Uploading event: ${event.name}...`);

  const form = new FormData();
  form.append("name", event.name);
  form.append("start_date", event.start_date);
  form.append("end_date", event.end_date);
  form.append("location_link", event.location_link);

  // Download event image
  const ext = ".jpg";
  const filepath = path.join(DOWNLOAD_DIR, `event-${Date.now()}${ext}`);
  console.log(`   Downloading event image: ${event.imageUrl}`);
  await downloadImage(event.imageUrl, filepath);
  const stats = fs.statSync(filepath);
  console.log(`   Downloaded: ${(stats.size / 1024).toFixed(1)} KB`);
  form.append("image", fs.createReadStream(filepath));

  try {
    const res = await axios.post(`${BASE_URL}/events`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000,
    });
    console.log(`   ✅ Uploaded event: ${event.name}`);
    return res.data;
  } catch (err) {
    console.error(`   ❌ Failed event: ${event.name} - ${err.response?.data?.error || err.message}`);
    return null;
  } finally {
    try { fs.unlinkSync(filepath); } catch {}
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   Kabba Designs - Automated Product Seeding      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  ensureDir(DOWNLOAD_DIR);

  // Login
  let token;
  try {
    token = await login();
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // Upload products
  let successCount = 0;
  let failCount = 0;
  for (const product of products) {
    const result = await uploadProduct(token, product);
    if (result) successCount++;
    else failCount++;
    await new Promise(r => setTimeout(r, 1000));
  }

  // Upload events
  let eventSuccess = 0;
  let eventFail = 0;
  for (const event of events) {
    const result = await uploadEvent(token, event);
    if (result) eventSuccess++;
    else eventFail++;
    await new Promise(r => setTimeout(r, 1000));
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════════");
  console.log("📊 UPLOAD SUMMARY");
  console.log(`   Products: ${successCount} succeeded, ${failCount} failed`);
  console.log(`   Events:   ${eventSuccess} succeeded, ${eventFail} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  // Cleanup
  try { fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true }); } catch {}

  console.log("✅ Seeding complete!");
})();