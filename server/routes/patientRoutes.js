const express = require("express");
const router = express.Router();
const { protectPatient } = require("../middleware/authMiddleware");
const {
  patientLogin,
  getPatientProfile,
  getPatientRecords,
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  searchPatients,
} = require("../controllers/patientController");

// Patient Portal Auth & Records Routes
router.post("/login", patientLogin);
router.get("/profile", protectPatient, getPatientProfile);
router.get("/records", protectPatient, getPatientRecords);

// Medical Records Endpoint (Alias for POST /api/medical-records)
router.post("/medical-records", createPatient);
router.get("/medical-records", protectPatient, getPatientRecords);

// Hospital Patient CRUD Routes
router.get("/search", searchPatients);

router.route("/")
  .post(createPatient)
  .get(getPatients);

router.route("/:id")
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
