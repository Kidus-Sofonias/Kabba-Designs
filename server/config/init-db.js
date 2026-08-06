const pool = require("./db");

const pgSchema = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price_birr REAL DEFAULT 0,
    price_dollar REAL DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    description TEXT,
    image_urls TEXT DEFAULT '[]',
    category TEXT DEFAULT 'Other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    out_of_stock_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT,
    image TEXT,
    quantity INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    location TEXT,
    payment TEXT,
    paid INTEGER DEFAULT 0,
    total REAL DEFAULT 0,
    tx_ref TEXT UNIQUE,
    product TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    variant TEXT
  );

  CREATE TABLE IF NOT EXISTS orders_temp (
    id SERIAL PRIMARY KEY,
    tx_ref TEXT UNIQUE,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    items TEXT DEFAULT '[]',
    total REAL DEFAULT 0,
    paid INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Migrate existing orders_temp tables that lack new columns
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS name TEXT;
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS address TEXT;
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS items TEXT DEFAULT '[]';
  ALTER TABLE orders_temp ADD COLUMN IF NOT EXISTS total REAL DEFAULT 0;

  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name TEXT,
    date DATE,
    end_date DATE,
    location_link TEXT,
    image_url TEXT
  );
`;

async function initializeDatabase() {
  try {
    await pool.query(pgSchema);
    console.log("Database schema initialized successfully with PostgreSQL.");
  } catch (err) {
    console.error("Database initialization error:", err);
    throw err;
  }
}

module.exports = initializeDatabase;