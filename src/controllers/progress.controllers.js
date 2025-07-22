const pool = require("../utils/db");
const addProgress = async (req, res) => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      userId references users(id) ON DELETE CASCADE,
      level INTEGER NOT NULL,
      reward VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    await pool.query(query);

    const { level, user } = req.body;

    // Check if the user exists
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [user]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Insert progress into the database
    const insertQuery =
      "INSERT INTO progress (userId, level, reward) VALUES ($1, $2, $3) RETURNING *";
    const reward = `Reward for level ${level}`;
    const result = await pool.query(insertQuery, [user, level, reward]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error adding progress:", error);
    res.status(500).json({ error: error.message });
  }
};
