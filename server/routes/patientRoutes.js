const express = require("express");
const router = express.Router();
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

// Patient Portal Routes
router.post("/login", patientLogin);
router.get("/profile", getPatientProfile);
router.get("/records", getPatientRecords);

// Hospital Patient CRUD Routes
router.get("/search", searchPatients);

router.route("/")
  .post(createPatient)
  .get(getPatients);

router.route("/:id")
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
