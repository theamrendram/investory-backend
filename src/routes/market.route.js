const express = require("express");
const router = express.Router();

const {getQuote,getHistoricalData, getLtpQuote} = require("../controllers/market.controller")

router.get("/quote", getQuote);
router.get("/historical-data", getHistoricalData);
router.get("/ltp-quote", getLtpQuote);

module.exports = router;
