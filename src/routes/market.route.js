const express = require("express");
const router = express.Router();

const {getQuote} = require("../controllers/market.controller")

router.get("/quote", getQuote);

module.exports = router;
