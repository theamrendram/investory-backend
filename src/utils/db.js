const pg = require("pg");
const { Pool } = pg;

// Validate environment variables
const requiredEnvVars = ["DB_USER", "DB_HOST", "DB_DATABASE", "DB_PASSWORD"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1); // Exit the application if any variable is missing
  }
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database...");
    release(); // Release the client back to the pool
  }
});

module.exports = pool;
