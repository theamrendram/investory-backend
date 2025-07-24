const Upstox = require("upstox-js-sdk");
const { getAccessToken } = require("../utils/get-access-token");
const axios = require("axios");
const { successResponse, errorResponse } = require("../utils/response");
const getQuote = async (req, res) => {
  const { symbol = "NSE_EQ|RELIANCE" } = req.query;
  console.log("symbol", symbol);

  let token;
  try {
    const tokenData = getAccessToken();
    token = tokenData.access_token;
  } catch (e) {
    return res.status(500).json(errorResponse(res, "Access token not found. Please authorize again.", 500));
  }

  try {
    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/quotes",
      {
        params: {
          instrument_key: symbol,
          interval: "1d",
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(successResponse(res, response.data, "Quote fetched successfully"));
  } catch (err) {
    console.error("Market SDK error:", err.response?.data || err.message);
    res.status(500).json(errorResponse(res, "Failed to fetch market data", 500));
  }
};

const getLtpQuote = async (req, res) => {
  const { symbol } = req.query;
  const tokenData = getAccessToken(); // should return object with access_token
  const token = tokenData.access_token;
  try {
    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/ltp",
      {
        params: {
          instrument_key: symbol,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("response", response.data);

    res.status(200).json(successResponse(res, response.data, "LTP fetched successfully"));
  } catch (error) {
    console.log("error occurred while fetching ltp", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const getHistoricalData = async (req, res) => {
  const { instrument_key, interval, to_date, from_date } = req.query;
  try {
    const response = await axios.get(
      `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    res.status(200).json(successResponse(res, response.data, "Historical data fetched successfully"));
  } catch (error) {
    console.log("error occurred while fetching historical data", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

module.exports = { getQuote, getHistoricalData,getLtpQuote };
