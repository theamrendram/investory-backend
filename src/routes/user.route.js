const {addUser, getUser} = require("../controllers/user.controller");
const router = require("express").Router();

router.post("/", addUser);
router.get("/:id", getUser);

module.exports = router;