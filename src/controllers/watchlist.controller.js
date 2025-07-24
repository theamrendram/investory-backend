const pool = require("../utils/db");
const { successResponse, errorResponse } = require("../utils/response");

const createWatchlistTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(firebase_uid) ON DELETE CASCADE,
      stock_name VARCHAR(100) NOT NULL,
      exchange VARCHAR(50),
      target_price DECIMAL(10, 2),
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, stock_name)
    );
  `;

  try {
    await pool.query(query);
    console.log("Watchlist table created.");
  } catch (error) {
    console.error("Error creating watchlist table:", error.message);
  }
};

const addToWatchlist = async (req, res) => {
  const { user_id, stock_name, exchange, target_price } = req.body;
  try {
    const query = `
      INSERT INTO watchlist (user_id, stock_name, exchange, target_price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, stock_name) DO UPDATE
      SET target_price = EXCLUDED.target_price,
          exchange = EXCLUDED.exchange
      RETURNING *;
    `;

    const result = await pool.query(query, [
      user_id,
      stock_name,
      exchange,
      target_price,
    ]);

    res.status(200).json(successResponse(res, result.rows[0], "Added/Updated watchlist"));
  } catch (error) {
    console.error("Error adding to watchlist:", error.message);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const getUserWatchlist = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC`;
    const result = await pool.query(query, [userId]);
    res.status(200).json(successResponse(res, result.rows, "Watchlist fetched successfully"));
  } catch (error) {
    console.error("Error fetching watchlist:", error.message);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const removeFromWatchlist = async (req, res) => {
  const { user_id, stock_name } = req.body;

  try {
    const query = `DELETE FROM watchlist WHERE user_id = $1 AND stock_name = $2 RETURNING *`;
    const result = await pool.query(query, [user_id, stock_name]);

    if (result.rowCount === 0) {
      return res.status(404).json(errorResponse(res, "Stock not found in watchlist", 404));
    }

    res.status(200).json(successResponse(res, result.rows[0], "Removed from watchlist"));
  } catch (error) {
    console.error("Error removing from watchlist:", error.message);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

module.exports = {
  addToWatchlist,
  getUserWatchlist,
  removeFromWatchlist,
};

