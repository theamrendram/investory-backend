const pool = require("../utils/db");
const { successResponse, errorResponse } = require("../utils/response");

const updateUserLevel = async (req, res) => {
  const { level } = req.body;
  console.log("level", level);
  try {

    const user = req.user;
    const query = `UPDATE users SET "currentLevel" = $1 WHERE id = $2`;
    const result = await pool.query(query, [level, user.id]);
    res.status(200).json(successResponse(res, result.rows[0], "User level updated successfully"));
  } catch (error) {
    console.log("error", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

module.exports = {
  updateUserLevel,
};