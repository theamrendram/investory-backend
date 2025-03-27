const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();

// connectDB();

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

// const stockRoutes = require("./routes/stocks.route");
const userRoutes = require("./routes/user.route");
// Routes
// app.use("/api/stocks", stockRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;

// http://localhost:8000/callback?code=ldNPsz
