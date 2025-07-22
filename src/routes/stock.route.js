const {addStock,
    getStockById,
    getStockByInstrumentId,
    getAllStock,
    createStockTables,} = require("../controllers/stocks.controller");
const router = require("express").Router();

router.post("/", addStock);
router.get("/", getAllStock);
router.get("/:id", getStockById);
router.get("/inst/:id", getStockByInstrumentId);

module.exports = router;