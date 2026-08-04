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
router.use("/admin", adminRoutes);
router.use("/hospital", hospitalRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/patient", patientRoutes);
router.use("/patients", patientRoutes);
router.use("/citizen", citizenRoutes);
router.use("/citizens", citizenRoutes);
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
