const express = require("express");
const router = express.Router();
const {
  registerCitizen,
  lookupCitizen,
  getCitizenProfile,
  getCitizenTimeline,
} = require("../controllers/citizenController");

// POST /api/citizens or POST /api/citizen/register - Newborn Registration
router.post("/register", registerCitizen);
router.post("/", registerCitizen);

// GET /api/citizens/lookup - Patient Lookup by Birth Certificate Number
router.get("/lookup", lookupCitizen);

// Profile and Timeline
router.get("/profile/:healthId", getCitizenProfile);
router.get("/timeline/:healthId", getCitizenTimeline);

module.exports = router;
