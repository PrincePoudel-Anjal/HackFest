const express = require("express");
const router = express.Router();
const { uploadReport, getReportsByHealthId } = require("../controllers/reportController");

router.post("/upload", uploadReport);
router.get("/patient/:healthId", getReportsByHealthId);

module.exports = router;
