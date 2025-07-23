const pool = require("../utils/db");
const { generate } = require("../services/assistant");
const fetchPreviousMessages = async (req, res) => {
  const { session_token } = req.params;
  console.log("session_token", session_token);
  if (!session_token) {
    return res.status(400).json({ error: "Session token is required" });
  }

  const query = `
    SELECT id, user_id, prompt, response, stock_context, created_at
    FROM conversations
    WHERE session_token = $1
    ORDER BY created_at ASC;
  `;

  try {
    const result = await pool.query(query, [session_token]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching previous messages:", error);
    res.status(500).json({ error: error.message });
  }
};

const createConversationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(firebase_uid),
      session_token VARCHAR(255) NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      stock_context TEXT, 
      memory_context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Conversations table created successfully");
  } catch (error) {
    console.error("Error creating conversations table:", error);
  }
};

// Save both user message and Gemini's reply to DB
const sendResponse = async (req, res) => {
  const { user_id, session_token, messages, stock_context, memory_context } =
    req.body;

  // Validate messages array
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  console.log("Received full messages:", messages);

  try {
    // Step 1: Send full history to Gemini
    const response = await generate(messages);

    const aiReply =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, something went wrong.";

    // Step 2: Extract last user message
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    const userPrompt = lastUserMessage?.parts?.[0] || "";

    // Step 3: Save User Message (Prompt)
    const insertUser = `
      INSERT INTO conversations (user_id, session_token, prompt, response, stock_context, memory_context)
      VALUES ($1, $2, $3, '', $4, $5)
    `;
    await pool.query(insertUser, [
      user_id || null,
      "session_token",
      userPrompt,
      stock_context || null,
      memory_context || null,
    ]);

    // Step 4: Save Gemini Reply (Response)
    const insertAI = `
      INSERT INTO conversations (user_id, session_token, prompt, response, stock_context, memory_context)
      VALUES ($1, $2, '', $3, $4, $5)
    `;
    await pool.query(insertAI, [
      user_id || null,
      "session_token",
      aiReply,
      stock_context || null,
      memory_context || null,
    ]);

    // Step 5: Send Reply Back
    res.status(200).json({
      message: "Message processed successfully",
      ai_response: aiReply,
    });
  } catch (error) {
    console.error("Error sending response:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchPreviousMessages,
  sendResponse,
  createConversationsTable,
};
