const express = require("express");
const router = express.Router();
const {
  createHospital,
  getHospitals,
  getHospitalDoctors,
  searchCitizenByHealthId,
  hospitalLogin,
} = require("../controllers/hospitalController");

// POST /api/hospital/login - Hospital Authentication
router.post("/login", hospitalLogin);

// GET /api/hospital/doctors - Returns all doctors belonging to the logged-in hospital's document array in MongoDB
router.get("/doctors", getHospitalDoctors);

// POST /api/hospitals & GET /api/hospitals
router.route("/")
  .post(createHospital)
  .get(getHospitals);

// GET /api/hospitals/search-patient
router.get("/search-patient", searchCitizenByHealthId);

module.exports = router;
