const express = require("express");
const router = express.Router();
const { getCitizenProfile, getCitizenTimeline } = require("../controllers/citizenController");

router.get("/profile/:healthId", getCitizenProfile);
router.get("/timeline/:healthId", getCitizenTimeline);

module.exports = router;
