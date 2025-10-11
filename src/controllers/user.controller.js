const pool = require("../utils/db");
const { successResponse, errorResponse } = require("../utils/response");

// Function to create the users table
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      amount DECIMAL(10, 4) DEFAULT 10000.0000,
      currentLevel SMALLINT DEFAULT 1,
      totalBalance DECIMAL(10, 2) DEFAULT 10000.00,
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

// Function to add a user
const addUser = async (req, res) => {
  const { name, email, phone, firebase_uid } = req.body;
  const query = `
    INSERT INTO users (name, email, phone, firebase_uid)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [firebase_uid]
    );
    if (user.rows.length > 0) {
      const userData = user.rows[0];
      return res
        .status(200)
        .json(successResponse(res, userData, "User already exists"));
    }

    const result = await pool.query(query, [
      name,
      email,
      phone,
      firebase_uid,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(500)
        .json(errorResponse(res, "Failed to create user", 500));
    }
    const userData = result.rows[0];
    console.log("userData", userData);
    console.log("User created:", userData);
    res
      .status(201)
      .json(successResponse(res, userData, "User created successfully"));
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

// Function to get a user by ID
const getUser = async (req, res) => {
  const { id } = req.params;
  const r = await createUsersTable();
  console.log("r", r);

  const query = `
    SELECT * FROM users WHERE id = $1;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse(res, "User not found", 404));
    }
    res
      .status(200)
      .json(successResponse(res, result.rows[0], "User fetched successfully"));
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

// Export the functions
module.exports = {
  addUser,
  getUser,
  createUsersTable,
};
