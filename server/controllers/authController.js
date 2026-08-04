// Auth Controller Stub
exports.loginCitizen = async (req, res, next) => {
  try {
    const { healthId } = req.body;
    // Basic response setup
    res.json({
      success: true,
      message: "Citizen login successful",
      role: "citizen",
      healthId: healthId || "NP-9841-0021",
    });
  } catch (error) {
    next(error);
  }
};

exports.loginDoctor = async (req, res, next) => {
  try {
    const { licenseNumber } = req.body;
    res.json({
      success: true,
      message: "Doctor authenticated",
      role: "doctor",
      doctorName: "Dr. Sushil Adhikari",
      hospital: "Tribhuvan University Teaching Hospital",
    });
  } catch (error) {
    next(error);
  }
};
