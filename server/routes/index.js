const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const citizenRoutes = require("./citizenRoutes");
const hospitalRoutes = require("./hospitalRoutes");
const patientRoutes = require("./patientRoutes");
const reportRoutes = require("./reportRoutes");
const aiRoutes = require("./aiRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/citizen", citizenRoutes);
router.use("/hospital", hospitalRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/patients", patientRoutes); // Supports POST /api/patients & GET /api/patients
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
