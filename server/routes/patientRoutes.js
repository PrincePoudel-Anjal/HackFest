const express = require("express");
const router = express.Router();
const { createPatient, getPatients } = require("../controllers/patientController");

// POST /api/patients - Create a new patient record in MongoDB
// GET  /api/patients - Fetch all patient records
router.route("/")
  .post(createPatient)
  .get(getPatients);

module.exports = router;
