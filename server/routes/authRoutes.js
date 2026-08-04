const express = require("express");
const router = express.Router();
const { loginCitizen, loginDoctor } = require("../controllers/authController");

router.post("/login/citizen", loginCitizen);
router.post("/login/doctor", loginDoctor);

module.exports = router;
