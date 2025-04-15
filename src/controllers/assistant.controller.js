const pool = require("../utils/db");
const { generate } = require("../services/assistant");
const fetchPreviousMessage = async () => {
  //   const query = `
  //     SELECT message_id, message, role, created_at
  //     FROM messages
  //     WHERE role = 'assistant'
  //     ORDER BY created_at DESC
  //     `;
};

// const createMessageTable = async () => {
//   const query = `
//   CREATE TABLE IF NOT EXISTS chat_messages (
//   id SERIAL PRIMARY KEY,
//   uid TEXT NOT NULL,
//   sender TEXT NOT NULL,
//   message TEXT NOT NULL,
//   timestamp TIMESTAMP DEFAULT NOW(),
//   metadata JSONB
// );
// `;

//   try {
//     await pool.query(query);
//     console.log("Chat messages table created successfully");
//   } catch (error) {
//     console.error("Error creating chat messages table:", error);
//   }
// };

const sendResponse = async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages are required" });
  }

  console.log("Received full messages:", messages);

  try {
    const response = await generate(messages);
    const aiReply =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, something went wrong.";

    console.log("AI Reply:", aiReply);

    res.status(200).json({
      message: "Message received successfully",
      data: messages,
      ai_response: aiReply,
    });
  } catch (error) {
    console.error("Error sending response:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchPreviousMessage,
  sendResponse,
};
