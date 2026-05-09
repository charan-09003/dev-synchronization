const express = require("express");
const { verifyToken } = require("../controllers/authController");
const { executeCode } = require("../controllers/executeController");

const router = express.Router();

router.use(verifyToken);

router.post("/", executeCode);

module.exports = router;