const {
  getUserProgress,
  updateLevelProgress,
  completeLevel,
  resetLevelProgress,
  updateUserLevel,
} = require("../controllers/progress.controller");
const express = require("express");
const router = express.Router();

// Get all user progress
router.get("/", getUserProgress);

// Update level progress (tasks or quiz)
router.put("/level/:levelId", updateLevelProgress);

// Complete level (award money, badge, unlock next)
router.post("/level/:levelId/complete", completeLevel);

// Reset level progress (for failed quiz attempts)
router.put("/level/:levelId/reset", resetLevelProgress);

// Legacy route for backward compatibility
router.put("/level", updateUserLevel);

module.exports = router;
