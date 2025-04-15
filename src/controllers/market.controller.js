const Upstox = require("upstox-js-sdk");
const { getAccessToken } = require("../utils/get-access-token");


const getQuote = async (req, res) => {
  const { symbol = "NSE_EQ|RELIANCE" } = req.query;
  console.log("symbol", symbol);

  let token;
  try {
    const tokenData = getAccessToken(); // should return object with access_token
    token = tokenData.access_token;
  } catch (e) {
    return res.status(500).json({
      error: "Access token not found. Please authorize again.",
    });
  }

  try {
    // Configure the SDK with the access token
    const defaultClient = Upstox.ApiClient.instance;
    const oauth2 = defaultClient.authentications["OAUTH2"];
    oauth2.accessToken = token;

    const apiInstance = new Upstox.ApiClient() // Default API includes marketQuote

    const response = await apiInstance.getQuotes(symbol);

    res.json(response);
  } catch (err) {
    console.error("Market SDK error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};

module.exports = { getQuote };
