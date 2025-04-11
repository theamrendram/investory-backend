const router = require("express").Router();

router.post("/", (req, res) => {
  const broadcastData = req.body;
  const io = req.app.get("io");

  if (!io) {
    return res.status(500).json({ error: "Socket.IO instance not available" });
  }

  io.emit("marketData", broadcastData);

  res.status(200).json({ message: "Data broadcasted successfully" });
});

module.exports = router;
