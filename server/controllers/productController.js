const { put } = require("@vercel/blob");
const pool = require("../config/db");

// Upload a buffer to Vercel Blob and return the public URL.
async function uploadToBlob(buffer, filename, contentType, folder) {
  const result = await put(`${folder}/${filename}`, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });
  return result.url;
}

// Helper to insert variants
async function insertVariants(variants, productId) {
  if (!variants || !variants.length) return;
  for (const v of variants) {
    await pool.query(
      "INSERT INTO product_variants (product_id, name, image, quantity) VALUES ($1, $2, $3, $4)",
      [productId, v.name || "", typeof v.image === "string" ? v.image : "", v.quantity || 0]
    );
  }
}

exports.createProduct = async (req, res) => {
  try {
    const name = req.body.name || "";
    const price_birr = req.body.price_birr || "";
    const price_dollar = req.body.price_dollar || "";
    const quantity = req.body.quantity || 0;
    const description = req.body.description || "";
    const category = req.body.category || "Other";
    let variants = [];
    try {
      variants = req.body.variants ? JSON.parse(req.body.variants) : [];
    } catch {
      variants = [];
    }

    // Upload main images to Vercel Blob (multer memory storage → buffers)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const mainFiles = req.files.filter((f) => f.fieldname === "images");
      for (const file of mainFiles) {
        const url = await uploadToBlob(
          file.buffer,
          file.originalname || "product.jpg",
          file.mimetype || "image/jpeg",
          "kabba-products"
        );
        imageUrls.push(url);
      }
    }

    // Upload variant images to Vercel Blob
    for (let idx = 0; idx < variants.length; idx++) {
      const v = variants[idx];
      if (v.image && typeof v.image === "string" && v.image.startsWith("variant_image_")) {
        const file = req.files.find((f) => f.fieldname === v.image);
        if (file) {
          variants[idx].image = await uploadToBlob(
            file.buffer,
            file.originalname || `variant-${idx}.jpg`,
            file.mimetype || "image/jpeg",
            "kabba-variants"
          );
        } else {
          variants[idx].image = "";
        }
      } else if (v.image && typeof v.image !== "string") {
        const file = req.files.find((f) => f.originalname === v.image.originalname);
        if (file) {
          variants[idx].image = await uploadToBlob(
            file.buffer,
            file.originalname || `variant-${idx}.jpg`,
            file.mimetype || "image/jpeg",
            "kabba-variants"
          );
        } else {
          variants[idx].image = "";
        }
      }
    }

    if (!name || (!price_birr && price_birr !== 0) || !imageUrls.length) {
      console.log("Validation failed", { name, price_birr, imageUrls });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const priceBirrNum = Number(price_birr) || 0;
    const priceDollarNum = Number(price_dollar) || 0;
    const quantityNum = Number(quantity) || 0;

    const sql =
      "INSERT INTO products (name, price_birr, price_dollar, quantity, description, image_urls, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
    const values = [name, priceBirrNum, priceDollarNum, quantityNum, description, JSON.stringify(imageUrls), category];

    try {
      const result = await pool.query(sql, values);
      const productId = result.rows[0].id;
      await insertVariants(variants, productId);
      res.json({ message: "Product uploaded", id: productId });
    } catch (err) {
      console.error("DB INSERT ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    const products = result.rows;

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const varResult = await pool.query(
          "SELECT id, name, image, quantity FROM product_variants WHERE product_id = $1",
          [product.id]
        );
        return { ...product, variants: varResult.rows || [] };
      })
    );

    res.json(productsWithVariants);
  } catch (err) {
    console.error("getAllProducts error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    const product = result.rows[0];
    const varResult = await pool.query(
      "SELECT id, name, image, quantity FROM product_variants WHERE product_id = $1",
      [id]
    );
    res.json({ ...product, variants: varResult.rows || [] });
  } catch (err) {
    console.error("getProductById error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, price_birr, price_dollar, quantity, description, category } = req.body;

  let imageUrls = [];

  if (req.files && req.files.length > 0) {
    try {
      for (const file of req.files) {
        const url = await uploadToBlob(
          file.buffer,
          file.originalname || "product.jpg",
          file.mimetype || "image/jpeg",
          "kabba-products"
        );
        imageUrls.push(url);
      }
    } catch (err) {
      console.error("Blob upload error:", err);
      return res.status(500).json({ error: "Image upload failed" });
    }
  }

  let sql = "UPDATE products SET name=$1, price_birr=$2, price_dollar=$3, quantity=$4, description=$5, category=$6";
  const values = [name, price_birr, price_dollar, quantity, description, category];

  if (imageUrls.length) {
    sql += ", image_urls=$7";
    values.push(JSON.stringify(imageUrls));
  }
  sql += " WHERE id=$" + (values.length + 1);
  values.push(id);

  try {
    await pool.query(sql, values);
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM product_variants WHERE product_id = $1", [id]);
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateVariant = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  let imageUrl = null;

  try {
    if (req.file) {
      imageUrl = await uploadToBlob(
        req.file.buffer,
        req.file.originalname || `variant-${id}.jpg`,
        req.file.mimetype || "image/jpeg",
        "kabba-variants"
      );
    }

    if (imageUrl) {
      await pool.query(
        "UPDATE product_variants SET name=$1, quantity=$2, image=$3 WHERE id=$4",
        [name, quantity, imageUrl, id]
      );
    } else {
      await pool.query(
        "UPDATE product_variants SET name=$1, quantity=$2 WHERE id=$3",
        [name, quantity, id]
      );
    }
    res.json({ message: "Variant updated" });
  } catch (err) {
    console.error("Update variant error:", err);
    res.status(500).json({ error: "Failed to update variant" });
  }
};

exports.deleteVariant = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM product_variants WHERE id=$1", [id]);
    res.json({ message: "Variant deleted" });
  } catch (err) {
    console.error("deleteVariant error:", err);
    res.status(500).json({ error: err.message });
  }
};
