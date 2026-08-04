const MedicalReport = require("../models/MedicalReport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * @desc    Upload & Save Real-Life Patient Medical Report into MongoDB Database
 * @route   POST /api/reports/upload
 */
exports.uploadReport = async (req, res, next) => {
  try {
    const {
      patientName,
      birthCertificateNumber,
      assignedDoctor,
      symptoms,
      assignedHospital,
      healthId,
      title,
      category,
      metrics,
      notes,
    } = req.body;

    // Extract Hospital Name from Token if available
    let hospitalFromToken = assignedHospital;
    const token = req.cookies?.hospitalToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.name) {
          hospitalFromToken = decoded.name;
        }
      } catch (err) {
        // Token fallback
      }
    }

    // Validation
    if (!patientName || !patientName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'patientName' is required.",
      });
    }

    if (!birthCertificateNumber && !healthId) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'birthCertificateNumber' or 'healthId' is required.",
      });
    }

    if (!assignedDoctor || !assignedDoctor.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'assignedDoctor' is required.",
      });
    }

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'symptoms' (Patient complaints) are required.",
      });
    }

    const finalHospital = hospitalFromToken || assignedHospital || "Tribhuvan University Teaching Hospital (TUTH)";
    const finalHealthId = healthId || birthCertificateNumber || "NP-9841-0021";

    // Save Real-Life Medical Report to MongoDB Database
    const report = await MedicalReport.create({
      patientName: patientName.trim(),
      birthCertificateNumber: (birthCertificateNumber || finalHealthId).trim(),
      assignedDoctor: assignedDoctor.trim(),
      symptoms: symptoms.trim(),
      assignedHospital: finalHospital,
      healthId: finalHealthId,
      title: title || "Clinical Diagnostic & Evaluation Report",
      category: category || "Blood Test",
      recordDate: new Date(),
      metrics: {
        bloodSugar: metrics?.bloodSugar || 137,
        hba1c: metrics?.hba1c || 6.7,
        bloodPressureSystolic: metrics?.bp ? parseInt(metrics.bp.split("/")[0]) : 140,
        bloodPressureDiastolic: metrics?.bp ? parseInt(metrics.bp.split("/")[1]) : 90,
        eGFR: metrics?.eGFR || 88,
      },
      notes: notes || `Patient presented with: ${symptoms}. Evaluation recorded by ${assignedDoctor} at ${finalHospital}.`,
    });

    console.log(`[DATABASE REPORT SUCCESS] Saved Medical Report '${report._id}' for Patient '${patientName}' at '${finalHospital}'!`);

    res.status(201).json({
      success: true,
      message: `Medical report for '${patientName}' saved to MongoDB database at '${finalHospital}'!`,
      report,
    });
  } catch (error) {
    console.error("[DATABASE REPORT ERROR]", error);
    next(error);
  }
};

/**
 * @desc    Fetch Medical Reports for a Citizen from MongoDB Database
 * @route   GET /api/reports/:healthId
 */
exports.getReportsByHealthId = async (req, res, next) => {
  try {
    const { healthId } = req.params;
    const reports = await MedicalReport.find({
      $or: [{ healthId }, { birthCertificateNumber: healthId }],
    }).sort({ recordDate: -1 });

    res.json({
      success: true,
      healthId,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};
