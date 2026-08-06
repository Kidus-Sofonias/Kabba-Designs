const { put } = require("@vercel/blob");
const pool = require("./config/db");
const fs = require("fs");

// ─── Realistic Ethiopian Sample Data ────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  {
    name: "Habesha Kemis – Traditional Ethiopian Dress",
    price_birr: 4500,
    price_dollar: 78,
    quantity: 25,
    description: "Elegant handwoven cotton habesha kemis with intricate Ethiopian embroidery on the chest, cuffs, and hem. Features traditional 'tilet' (cross) patterns and colorful border details. Perfect for weddings, holidays, and cultural celebrations. Available in white with vibrant edge accents.",
    category: "Women",
    variants: [
      { name: "Size S", quantity: 8 },
      { name: "Size M", quantity: 10 },
      { name: "Size L", quantity: 7 },
    ],
    imageKeywords: ["ethiopian traditional dress", "habesha kemis white"],
  },
  {
    name: "Netela – Handwoven Cotton Scarf",
    price_birr: 850,
    price_dollar: 15,
    quantity: 50,
    description: "Traditional Ethiopian netela scarf made from hand-spun cotton. Features colorful 'tilet' border stripes in green, yellow, red, and blue. Lightweight and breathable, perfect as a shawl or wrap for daily wear and special occasions.",
    category: "Women",
    variants: [
      { name: "White / Green Border", quantity: 20 },
      { name: "White / Gold Border", quantity: 16 },
      { name: "White / Multicolor", quantity: 14 },
    ],
    imageKeywords: ["ethiopian netela scarf traditional"],
  },
  {
    name: "Tibeb Ethiopian Cotton Fabric – 2 Meters",
    price_birr: 1200,
    price_dollar: 21,
    quantity: 30,
    description: "Authentic Ethiopian 'tibeb' or 'shema' handwoven cotton fabric. Features traditional decorative border patterns (tilet) in vibrant Ethiopian colors. Ideal for custom dressmaking, decor, or cultural attire. Each piece is unique and handcrafted by Ethiopian artisans.",
    category: "Women",
    variants: [
      { name: "Yellow & Green Border", quantity: 10 },
      { name: "Red & Gold Border", quantity: 10 },
      { name: "Blue & Silver Border", quantity: 10 },
    ],
    imageKeywords: ["ethiopian shema fabric handwoven colored"],
  },
  {
    name: "Ethiopian Cultural Jewelry Set – Cross Pendant & Earrings",
    price_birr: 3200,
    price_dollar: 55,
    quantity: 15,
    description: "Exquisite Ethiopian Orthodox cross pendant with matching filigree earrings. Handcrafted by skilled silversmiths in Addis Ababa's Merkato. Made from sterling silver with intricate geometric patterns. Includes adjustible chain. A timeless piece of Ethiopian heritage.",
    category: "Jewelry",
    variants: [
      { name: "Silver – Small Cross", quantity: 5 },
      { name: "Silver – Large Cross", quantity: 5 },
      { name: "Gold-Plated – Medium", quantity: 5 },
    ],
    imageKeywords: ["ethiopian silver cross jewelry"],
  },
  {
    name: "Ethiopian Men's Jodhpuri Suit – Modern Traditional",
    price_birr: 6800,
    price_dollar: 118,
    quantity: 12,
    description: "Contemporary Ethiopian jodhpuri suit blending modern tailoring with traditional elegance. Features a mandarin collar with subtle Ethiopian pattern embroidery, two-button closure, and matching trousers. Premium Ethiopian fabric blend. Ideal for weddings, holidays, and formal events.",
    category: "Men",
    variants: [
      { name: "Size 40 (S)", quantity: 3 },
      { name: "Size 42 (M)", quantity: 4 },
      { name: "Size 44 (L)", quantity: 3 },
      { name: "Size 46 (XL)", quantity: 2 },
    ],
    imageKeywords: ["ethiopian men jodhpuri suit traditional"],
  },
  {
    name: "Ethiopian Leather Messenger Bag – Cross Design",
    price_birr: 2800,
    price_dollar: 48,
    quantity: 20,
    description: "Handcrafted genuine Ethiopian leather messenger bag with embossed Ethiopian cross design. Made by artisans in Addis Ababa's 'Merkato' leather district. Features adjustable shoulder strap, interior zip pocket, and brass hardware. Rich dark brown leather that ages beautifully.",
    category: "Other",
    variants: [
      { name: "Dark Brown – Medium", quantity: 8 },
      { name: "Black – Medium", quantity: 7 },
      { name: "Dark Brown – Large", quantity: 5 },
    ],
    imageKeywords: ["ethiopian leather messenger bag brown"],
  },
  {
    name: "Traditional Ethiopian Baby Blanket – 'Kuskuam'",
    price_birr: 950,
    price_dollar: 16,
    quantity: 35,
    description: "Soft, breathable cotton baby blanket featuring traditional Ethiopian patterns and colors. Inspired by the 'Kuskuam' cultural baby-wrapping tradition. Machine washable, hypoallergenic, and gentle on sensitive skin. A beautiful Ethiopian gift for newborns.",
    category: "Children",
    variants: [
      { name: "White / Green Trim", quantity: 12 },
      { name: "White / Gold Trim", quantity: 12 },
      { name: "White / Multi Pattern", quantity: 11 },
    ],
    imageKeywords: ["ethiopian baby blanket cotton traditional"],
  },
];

const SAMPLE_EVENTS = [
  {
    name: "Addis Ababa Fashion Week 2026 – Ethiopian Designer Showcase",
    date: "2026-08-15",
    end_date: "2026-08-18",
    location_link: "https://maps.app.goo.gl/mQMQh7EbeA7cKtv58",
    imageKeywords: ["fashion show", "addis ababa ethiopia"],
  },
  {
    name: "Traditional & Modern Habesha Wear Expo",
    date: "2026-09-22",
    end_date: "2026-09-24",
    location_link: "https://maps.app.goo.gl/JPJMPpPznRZJz7hYA",
    imageKeywords: ["ethiopian cultural festival", "habesha clothing"],
  },
  {
    name: "Ethiopian Orthodox Christmas Fashion Bazaar – Genna 2026",
    date: "2026-10-05",
    end_date: "2026-10-07",
    location_link: "https://maps.app.goo.gl/4G1HbDgxF8NHsK2R8",
    imageKeywords: ["ethiopian christmas market", "traditional clothing bazaar"],
  },
];

// Known reliable free stock image URLs (via Cloudinary demo, Pexels CDNs)
const RELIABLE_IMAGE_SOURCES = [
  "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/bicycle.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/food/fish-vegetables.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/people/kitchen-bar.jpg",
];

let imgCounter = 0;

/**
 * Upload a remote image to Vercel Blob (fetch it first, then put the buffer)
 */
async function uploadRemoteImage(sourceUrl, folder, publicId) {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    const msg = `Fetch failed (${res.status}) for ${sourceUrl}`;
    console.log(`\n    ⚠ ${msg}`);
    throw new Error(msg);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = (sourceUrl.split(".").pop() || "jpg").split("?")[0];
  const { url } = await put(
    `${folder || "kabba-seeds"}/${publicId}-${Date.now()}.${ext}`,
    buffer,
    { access: "public", addRandomSuffix: true }
  );
  return url;
}

/**
 * Generate a simple colored SVG placeholder and upload it to Vercel Blob
 */
async function uploadPlaceholderImage(color, label, folder, publicId) {
  // Create a simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="${color}"/>
    <text x="400" y="400" font-family="Arial" font-size="40" fill="white" text-anchor="middle" alignment-baseline="middle">${label}</text>
  </svg>`;

  const { url } = await put(
    `${folder || "kabba-seeds"}/${publicId}-placeholder-${Date.now()}.svg`,
    Buffer.from(svg),
    { access: "public", addRandomSuffix: true, contentType: "image/svg+xml" }
  );
  return url;
}

/**
 * Upload multiple images for a product
 */
async function uploadProductImages(product, productKey) {
  const imageUrls = [];
  const folder = "kabba-products";

  // Colors for product placeholders
  const colors = ["#8B4513", "#2F4F4F", "#800020", "#4A6741", "#B8860B", "#5C4033", "#4169E1"];

  // Try up to 2 reliable sources per product
  const sources = RELIABLE_IMAGE_SOURCES.slice(
    imgCounter % RELIABLE_IMAGE_SOURCES.length,
    (imgCounter % RELIABLE_IMAGE_SOURCES.length) + 2
  );
  imgCounter += 2;

  for (let idx = 0; idx < Math.min(sources.length, 2); idx++) {
    try {
      const url = await uploadRemoteImage(
        sources[idx],
        folder,
        `seed_${productKey}_${idx}`
      );
      imageUrls.push(url);
    } catch {
      // fall through to placeholder
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // If no images uploaded yet, create placeholder
  if (imageUrls.length === 0) {
    try {
      const color = colors[parseInt(productKey.split("_")[1]) % colors.length];
      const label = product.name.substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "");
      const url = await uploadPlaceholderImage(
        color,
        label,
        folder,
        `seed_${productKey}_placeholder`
      );
      imageUrls.push(url);
    } catch {
      imageUrls.push(RELIABLE_IMAGE_SOURCES[0]);
    }
  }

  return imageUrls;
}

/**
 * Upload an image for an event
 */
async function uploadEventImage(event, eventKey) {
  const folder = "kabba-events";
  const eventColors = ["#1a5276", "#922b21", "#1e8449"];

  // Try a reliable source first
  const sourceIdx = (imgCounter % RELIABLE_IMAGE_SOURCES.length);
  imgCounter++;
  const source = RELIABLE_IMAGE_SOURCES[sourceIdx];

  try {
    return await uploadRemoteImage(source, folder, `seed_${eventKey}`);
  } catch {
    // Fall back to placeholder
    try {
      const idx = parseInt(eventKey.split("_")[1]) - 1;
      const color = eventColors[idx % eventColors.length];
      const label = event.name.substring(0, 25).replace(/[^a-zA-Z0-9 ]/g, "");
      return await uploadPlaceholderImage(color, label, folder, `seed_${eventKey}_placeholder`);
    } catch {
      return RELIABLE_IMAGE_SOURCES[3];
    }
  }
}

/**
 * Insert a product with variants into the database
 */
async function insertProduct(product, imageUrls) {
  const sql = `
    INSERT INTO products (name, price_birr, price_dollar, quantity, description, image_urls, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  const values = [
    product.name,
    product.price_birr,
    product.price_dollar,
    product.quantity,
    product.description,
    JSON.stringify(imageUrls),
    product.category,
  ];

  const result = await pool.query(sql, values);
  const productId = result.rows[0].id;

  for (const v of product.variants) {
    await pool.query(
      "INSERT INTO product_variants (product_id, name, image, quantity) VALUES ($1, $2, $3, $4)",
      [productId, v.name, "", v.quantity]
    );
  }

  return productId;
}

/**
 * Insert an event into the database
 */
async function insertEvent(event, imageUrl) {
  const sql = `
    INSERT INTO events (name, date, end_date, location_link, image_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [event.name, event.date, event.end_date, event.location_link, imageUrl];
  const result = await pool.query(sql, values);
  return result.rows[0].id;
}

/**
 * Generate SQL file fallback
 */
function generateSqlFile(productImageMap, eventImageMap) {
  let sql = `-- Kabba Designs – Ethiopian Sample Data Seed
-- Generated on ${new Date().toISOString()}
-- Run: psql "$DATABASE_URL" -f seed-output.sql

BEGIN;

`;

  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const p = SAMPLE_PRODUCTS[i];
    const images = productImageMap[`product_${i + 1}`] || [];
    const imageUrlsJson = JSON.stringify(images).replace(/'/g, "''");

    sql += `-- ${p.name}
INSERT INTO products (name, price_birr, price_dollar, quantity, description, image_urls, category)
VALUES (
  '${p.name.replace(/'/g, "''")}',
  ${p.price_birr},
  ${p.price_dollar},
  ${p.quantity},
  '${p.description.replace(/'/g, "''")}',
  '${imageUrlsJson}',
  '${p.category}'
);

`;

    for (const v of p.variants) {
      sql += `INSERT INTO product_variants (product_id, name, image, quantity)
VALUES (currval(pg_get_serial_sequence('products', 'id')), '${v.name.replace(/'/g, "''")}', '', ${v.quantity});

`;
    }
    sql += "\n";
  }

  for (let i = 0; i < SAMPLE_EVENTS.length; i++) {
    const e = SAMPLE_EVENTS[i];
    const image = eventImageMap[`event_${i + 1}`] || "";

    sql += `-- ${e.name}
INSERT INTO events (name, date, end_date, location_link, image_url)
VALUES (
  '${e.name.replace(/'/g, "''")}',
  '${e.date}',
  '${e.end_date}',
  '${e.location_link}',
  '${image}'
);

`;
  }

  sql += "COMMIT;\n";
  fs.writeFileSync("seed-output.sql", sql, "utf8");
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   Kabba Designs – Ethiopian Sample Data Seeder   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const isDbConnected = await testDbConnection();

  // ── Upload Product Images ──
  console.log("─── Uploading Product Images to Cloudinary ───\n");
  const productImageMap = {};
  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const product = SAMPLE_PRODUCTS[i];
    const productKey = `product_${i + 1}`;
    process.stdout.write(`  [${i + 1}/${SAMPLE_PRODUCTS.length}] "${product.name}"... `);

    const urls = await uploadProductImages(product, productKey);
    productImageMap[productKey] = urls;
    console.log(`✓ (${urls.length} image${urls.length > 1 ? "s" : ""})`);
  }

  // ── Upload Event Images ──
  console.log("\n─── Uploading Event Images to Cloudinary ───\n");
  const eventImageMap = {};
  for (let i = 0; i < SAMPLE_EVENTS.length; i++) {
    const event = SAMPLE_EVENTS[i];
    const eventKey = `event_${i + 1}`;
    process.stdout.write(`  [${i + 1}/${SAMPLE_EVENTS.length}] "${event.name}"... `);

    const url = await uploadEventImage(event, eventKey);
    eventImageMap[eventKey] = url;
    console.log("✓");
  }

  // ── Insert into Database or Generate SQL ──
  console.log("\n─── Inserting Data ───\n");

  if (!isDbConnected) {
    console.log("  ❌ Could not connect to database.");
    console.log("  Generating SQL file with Cloudinary URLs instead...\n");
    generateSqlFile(productImageMap, eventImageMap);
    console.log('  ✅ SQL file saved: server/seed-output.sql');
    console.log('  ▶ Run: psql "$DATABASE_URL" -f seed-output.sql\n');
    console.log("  📋 Summary of data to be inserted:");
    console.log(`     Products: ${SAMPLE_PRODUCTS.length} (with ${SAMPLE_PRODUCTS.reduce((s, p) => s + p.variants.length, 0)} variants)`);
    console.log(`     Events:   ${SAMPLE_EVENTS.length}`);
    return;
  }

  // Insert products
  let insertedProducts = 0;
  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const product = SAMPLE_PRODUCTS[i];
    const productKey = `product_${i + 1}`;
    try {
      const id = await insertProduct(product, productImageMap[productKey]);
      console.log(`  ✓ Product inserted: "${product.name}" (ID: ${id})`);
      insertedProducts++;
    } catch (err) {
      console.log(`  ✗ Failed: "${product.name}": ${err.message}`);
    }
  }

  // Insert events
  let insertedEvents = 0;
  for (let i = 0; i < SAMPLE_EVENTS.length; i++) {
    const event = SAMPLE_EVENTS[i];
    const eventKey = `event_${i + 1}`;
    try {
      const id = await insertEvent(event, eventImageMap[eventKey]);
      console.log(`  ✓ Event inserted: "${event.name}" (ID: ${id})`);
      insertedEvents++;
    } catch (err) {
      console.log(`  ✗ Failed: "${event.name}": ${err.message}`);
    }
  }

  console.log(`\n─── Summary ───`);
  console.log(`  Products: ${insertedProducts}/${SAMPLE_PRODUCTS.length}`);
  console.log(`  Events:   ${insertedEvents}/${SAMPLE_EVENTS.length}`);
  console.log(insertedProducts > 0 || insertedEvents > 0 ? "\n✅ Complete!" : "\n❌ Nothing inserted.");
}

async function testDbConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("✓ Database connected\n");
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});