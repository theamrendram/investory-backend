const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user.route");
const marketRoute = require("./routes/market.route");
const authRoute = require("./routes/auth.route");
// Routes

app.use("/api/users", userRoutes);
app.use("/api/market", marketRoute);
app.use("/api/auth", authRoute);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
