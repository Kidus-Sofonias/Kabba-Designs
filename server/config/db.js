const { Pool } = require("pg");

// Parse connection string into individual params for IPv4 support
// family: 4 forces IPv4 connections (required on Render's IPv6 infrastructure)
const connectionString = process.env.DATABASE_URL;

function parseConnectionString(cs) {
  const url = new URL(cs.replace(/^postgres(?:ql)?:\/\//, "postgresql://"));
  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    database: url.pathname.replace(/^\//, ""),
  };
}

function createPool() {
  const poolConfig = {
    ssl: { rejectUnauthorized: false },
    family: 4,
  };

  if (connectionString) {
    try {
      const parsed = parseConnectionString(connectionString);
      poolConfig.user = parsed.user;
      poolConfig.password = parsed.password;
      poolConfig.host = parsed.host;
      poolConfig.port = parsed.port;
      poolConfig.database = parsed.database;
    } catch (err) {
      poolConfig.connectionString = connectionString;
    }
  }

  return new Pool(poolConfig);
}

const pool = createPool();
module.exports = pool;