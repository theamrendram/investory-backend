const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const authHandler = require("./middleware/auth.middleware");
const { errorHandler } = require("./middleware/errorHandler");

const userRoutes = require("./routes/user.route");
const marketRoute = require("./routes/market.route");
const authRoute = require("./routes/auth.route");
const broadcastRoute = require("./routes/broadcast.route");
const conversationRoute = require("./routes/conversation.route");
const stockRoute = require("./routes/stock.route");
const progressRoute = require("./routes/progress.route");
const watchlistRoute = require("./routes/watchlist.route");

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/market", marketRoute);
app.use("api/stocks", stockRoute);
app.use("/api/auth", authRoute);
app.use("/api/broadcast", broadcastRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/progress", authHandler, progressRoute);
app.use("/api/watchlist", watchlistRoute);
app.get("/", (req, res) => {
  res.send("Welcome to the Server!");
});

app.get("/error", (req, res) => {
  throw new Error("This is a test error");
});

app.use(errorHandler);

module.exports = app;