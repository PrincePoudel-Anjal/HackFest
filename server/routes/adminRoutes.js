const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAdminDashboard,
  createHospital,
  getHospitals,
  updateHospital,
  deleteHospital,
} = require("../controllers/adminController");

// POST /api/admin/login
router.post("/login", adminLogin);

// GET /api/admin/dashboard
router.get("/dashboard", getAdminDashboard);

// Hospital Management Routes: POST, GET, PUT, DELETE
router.route("/hospitals")
  .post(createHospital)
  .get(getHospitals);

router.route("/hospitals/:id")
  .put(updateHospital)
  .delete(deleteHospital);

module.exports = router;
