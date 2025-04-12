const {
    sendResponse, 
    fetchPreviousMessage
} = require("../controllers/assistant.controller");
const express = require("express");
const router = express.Router();

// Route to send a response
router.post("/", sendResponse);
// Route to fetch previous messages
router.get("/previous-messages", fetchPreviousMessage);

module.exports = router;