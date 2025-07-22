const { updateUserLevel } = require("../controllers/progress.controller");
const express = require("express");
const router = express.Router();

router.put("/level", updateUserLevel);

module.exports = router;
