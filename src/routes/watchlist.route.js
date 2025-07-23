const express = require("express");
const {
  addToWatchlist,
  getUserWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlist.controller");

const router = express.Router();

router.post("/add", addToWatchlist);           // POST /api/watchlist/add
router.get("/:user_id", getUserWatchlist);     // GET  /api/watchlist/101
router.delete("/remove", removeFromWatchlist); // DELETE /api/watchlist/remove

module.exports = router;
