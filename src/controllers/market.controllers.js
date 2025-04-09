const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getAccessToken } = require("../utils/get-access-token");

const getQuote = async (req, res) => {
  const { symbol = "NSE_EQ%7CRELIANCE" } = req.query;
  console.log("symbol", symbol);
  let token;
  try {
    const tokenData = getAccessToken();
    token = tokenData.access_token;
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Access token not found. Please authorize again." });
  }

  try {
    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/quotes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          instrument_key: symbol,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Market API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};

module.exports = { getQuote };
