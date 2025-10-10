const {
  sendResponse,
  fetchPreviousMessages,
  createConversationsTable,
} = require("../controllers/conversation.controller");

const express = require("express");
const router = express.Router();


// POST /api/assistant → Send prompt and get AI response
router.post("/", sendResponse);

// GET /api/assistant/:session_token → Fetch conversation history
router.get("/:session_token", fetchPreviousMessages);

module.exports = router;
