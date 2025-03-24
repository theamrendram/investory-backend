const pool = require("../utils/db");

// Function to add a user
const addUser = async (req, res) => {
  const { name, email, phone } = req.body;
  console.log("name", name);
  const query = `
    INSERT INTO users (name, email, phone)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name, email, phone]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get a user by ID
const getUser = async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT * FROM users WHERE id = $1;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to create the users table
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      amount DECIMAL(10, 4) DEFAULT 10000.0000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Export the functions
module.exports = {
  addUser,
  getUser,
  createUsersTable,
};

createUsersTable();
