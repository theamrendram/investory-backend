const pool = require("../utils/db");
const { successResponse, errorResponse } = require("../utils/response");

// Function to create all game-related tables
const createProgressTables = async () => {
  try {
    // Create user_progress table
    const progressTableQuery = `
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(firebase_uid) ON DELETE CASCADE,
        level_id INTEGER NOT NULL,
        tasks_completed JSONB DEFAULT '[]',
        quiz_answers JSONB DEFAULT '{}',
        quiz_score INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      );
    `;

    // Create user_badges table
    const badgesTableQuery = `
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(firebase_uid) ON DELETE CASCADE,
        level_id INTEGER NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      );
    `;

    // Update users table with game columns
    const updateUsersQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS currentLevel INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS totalBalance DECIMAL(10, 2) DEFAULT 10000.00;
    `;

    await pool.query(progressTableQuery);
    await pool.query(badgesTableQuery);
    await pool.query(updateUsersQuery);

    console.log("All game tables created/updated successfully");
  } catch (error) {
    console.error("Error creating game tables:", error);
    throw error;
  }
};

// Get all progress for authenticated user
const getUserProgress = async (req, res) => {
  try {
    await createProgressTables();

    const user = req.user;
    const userId = user.uid;

    // Get user's current level and balance
    const userQuery = `
      SELECT currentLevel, totalBalance 
      FROM users 
      WHERE firebase_uid = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    // Get all level progress
    const progressQuery = `
      SELECT level_id, tasks_completed, quiz_answers, quiz_score, 
             total_questions, is_completed, completed_at
      FROM user_progress 
      WHERE user_id = $1
      ORDER BY level_id
    `;
    const progressResult = await pool.query(progressQuery, [userId]);

    // Get earned badges
    const badgesQuery = `
      SELECT level_id, badge_name, earned_at
      FROM user_badges 
      WHERE user_id = $1
      ORDER BY level_id
    `;
    const badgesResult = await pool.query(badgesQuery, [userId]);

    const userData = userResult.rows[0] || {
      currentlevel: 1,
      totalbalance: 10000,
    };
    const progress = {};
    progressResult.rows.forEach((row) => {
      progress[row.level_id] = {
        tasksCompleted: row.tasks_completed || [],
        quizAnswers: row.quiz_answers || {},
        quizScore: row.quiz_score || 0,
        totalQuestions: row.total_questions || 0,
        isCompleted: row.is_completed || false,
        completedAt: row.completed_at,
      };
    });

    const badges = badgesResult.rows.map((row) => ({
      levelId: row.level_id,
      badgeName: row.badge_name,
      earnedAt: row.earned_at,
    }));

    res.status(200).json(
      successResponse(
        res,
        {
          currentLevel: userData.currentlevel,
          totalBalance: parseFloat(userData.totalbalance),
          progress,
          badges,
        },
        "User progress fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

// Update level progress (tasks or quiz)
const updateLevelProgress = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.uid;
    const { levelId } = req.params;
    const { tasksCompleted, quizAnswers, quizScore, totalQuestions } = req.body;

    const query = `
      INSERT INTO user_progress (user_id, level_id, tasks_completed, quiz_answers, quiz_score, total_questions, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, level_id)
      DO UPDATE SET
        tasks_completed = COALESCE($3, user_progress.tasks_completed),
        quiz_answers = COALESCE($4, user_progress.quiz_answers),
        quiz_score = COALESCE($5, user_progress.quiz_score),
        total_questions = COALESCE($6, user_progress.total_questions),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(query, [
      userId,
      levelId,
      JSON.stringify(tasksCompleted),
      JSON.stringify(quizAnswers),
      quizScore,
      totalQuestions,
    ]);

    res
      .status(200)
      .json(
        successResponse(
          res,
          result.rows[0],
          "Level progress updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating level progress:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

// Complete level - award money, badge, and unlock next level
const completeLevel = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = req.user;
    const userId = user.uid;
    const { levelId } = req.params;
    const { rewardMoney, badgeName } = req.body;

    // Validate quiz score >= 70%
    const progressQuery = `
      SELECT quiz_score, total_questions
      FROM user_progress 
      WHERE user_id = $1 AND level_id = $2
    `;
    const progressResult = await client.query(progressQuery, [userId, levelId]);

    if (progressResult.rows.length === 0) {
      throw new Error("Level progress not found");
    }

    const { quiz_score, total_questions } = progressResult.rows[0];
    const passPercentage = (quiz_score / total_questions) * 100;

    if (passPercentage < 70) {
      throw new Error("Quiz score must be at least 70% to complete level");
    }

    // Mark level as completed
    const completeProgressQuery = `
      UPDATE user_progress 
      SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND level_id = $2
    `;
    await client.query(completeProgressQuery, [userId, levelId]);

    // Award badge
    const badgeQuery = `
      INSERT INTO user_badges (user_id, level_id, badge_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, level_id) DO NOTHING
    `;
    await client.query(badgeQuery, [userId, levelId, badgeName]);

    // Update user balance and current level
    const updateUserQuery = `
      UPDATE users 
      SET totalBalance = totalBalance + $1, 
          currentLevel = GREATEST(currentLevel, $2 + 1)
      WHERE firebase_uid = $3
      RETURNING currentLevel, totalBalance
    `;
    const userResult = await client.query(updateUserQuery, [
      rewardMoney,
      levelId,
      userId,
    ]);

    await client.query("COMMIT");

    res.status(200).json(
      successResponse(
        res,
        {
          newLevel: userResult.rows[0].currentlevel,
          newBalance: parseFloat(userResult.rows[0].totalbalance),
          badgeEarned: badgeName,
          moneyAwarded: rewardMoney,
        },
        "Level completed successfully"
      )
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error completing level:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  } finally {
    client.release();
  }
};

// Reset level progress (for failed quiz attempts)
const resetLevelProgress = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.uid;
    const { levelId } = req.params;

    const query = `
      UPDATE user_progress 
      SET quiz_answers = '{}', quiz_score = 0, total_questions = 0, is_completed = FALSE, completed_at = NULL
      WHERE user_id = $1 AND level_id = $2
    `;

    await pool.query(query, [userId, levelId]);

    res
      .status(200)
      .json(successResponse(res, null, "Level progress reset successfully"));
  } catch (error) {
    console.error("Error resetting level progress:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

// Legacy function for backward compatibility
const updateUserLevel = async (req, res) => {
  const { level } = req.body;
  console.log("level", level);
  try {
    const user = req.user;
    const query = `UPDATE users SET "currentLevel" = $1 WHERE firebase_uid = $2`;
    const result = await pool.query(query, [level, user.uid]);
    res
      .status(200)
      .json(
        successResponse(res, result.rows[0], "User level updated successfully")
      );
  } catch (error) {
    console.log("error", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

module.exports = {
  createProgressTables,
  getUserProgress,
  updateLevelProgress,
  completeLevel,
  resetLevelProgress,
  updateUserLevel,
};
