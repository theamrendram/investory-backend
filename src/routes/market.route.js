const express = require("express");
const router = express.Router();

const {getQuote} = require("../controllers/market.controllers")

router.get("/quote", getQuote);

module.exports = router;
