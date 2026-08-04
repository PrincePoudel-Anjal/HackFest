const express = require("express");
const router = express.Router();
const {
  createHospital,
  getHospitals,
  searchCitizenByHealthId,
  hospitalLogin,
} = require("../controllers/hospitalController");

// POST /api/hospital/login - Hospital Authentication
router.post("/login", hospitalLogin);

// POST /api/hospitals & GET /api/hospitals
router.route("/")
  .post(createHospital)
  .get(getHospitals);

// GET /api/hospitals/search-patient
router.get("/search-patient", searchCitizenByHealthId);

module.exports = router;
