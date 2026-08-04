const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAdminMe,
  adminLogout,
  getSystemStats,
  getHospitals,
  addHospital,
  updateHospitalDetails,
  getDoctors,
  addDoctor,
  deleteDoctor,
  updateDoctorDetails,
  assignDoctorToHospital,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/me", getAdminMe);
router.post("/logout", adminLogout);
router.get("/stats", getSystemStats);

// Hospital Database Routes
router.get("/hospitals", getHospitals);
router.post("/hospitals", addHospital);
router.put("/hospitals/:hospitalId", updateHospitalDetails);

// Doctor Database Routes
router.get("/doctors", getDoctors);
router.post("/doctors", addDoctor);
router.delete("/doctors/:doctorId", deleteDoctor);
router.put("/doctors/:doctorId", updateDoctorDetails);
router.put("/doctors/assign", assignDoctorToHospital);

module.exports = router;
