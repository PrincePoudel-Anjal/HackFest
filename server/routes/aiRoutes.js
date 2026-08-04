const express = require("express");
const router = express.Router();
const { analyzePatientHistory } = require("../controllers/aiController");

router.post("/analyze", analyzePatientHistory);

module.exports = router;
