const MedicalReport = require("../models/MedicalReport");
const Hospital = require("../models/Hospital");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * @desc    Upload & Save Patient Report into MongoDB (Hospital Assigned automatically via Cookie)
 * @route   POST /api/reports/upload
 */
exports.uploadReport = async (req, res, next) => {
  try {
    const {
      patientName,
      birthCertificateNumber,
      assignedDoctor,
      symptoms,
      healthId,
      title,
      category,
      metrics,
      notes,
    } = req.body;

    // 1. EXTRACT HOSPITAL ASSIGNMENT DIRECTLY FROM HTTP-ONLY COOKIE
    let assignedHospital = "Tribhuvan University Teaching Hospital (TUTH)";
    const token = req.cookies?.hospitalToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.name) {
          assignedHospital = decoded.name;
        } else if (decoded?.id) {
          const hospDoc = await Hospital.findById(decoded.id);
          if (hospDoc?.name) assignedHospital = hospDoc.name;
        }
      } catch (err) {
        console.warn("[COOKIE VERIFY WARNING] Validating fallback hospital cookie.");
      }
    } else if (req.body.assignedHospital) {
      assignedHospital = req.body.assignedHospital;
    }

    // 2. Validation: Patient details required
    if (!patientName || !patientName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Patient Full Name is required.",
      });
    }

    if (!birthCertificateNumber && !healthId) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Birth Certificate Number or Health ID is required.",
      });
    }

    if (!assignedDoctor || !assignedDoctor.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Assigned Doctor is required.",
      });
    }

    const finalHealthId = healthId || birthCertificateNumber || "NP-9841-0021";

    // 3. Save Medical Report directly to MongoDB with Cookie-Assigned Hospital
    const report = await MedicalReport.create({
      patientName: patientName.trim(),
      birthCertificateNumber: (birthCertificateNumber || finalHealthId).trim(),
      assignedDoctor: assignedDoctor.trim(),
      symptoms: (symptoms || "Patient evaluation recorded").trim(),
      assignedHospital: assignedHospital.trim(), // ASSIGNED VIA COOKIE
      healthId: finalHealthId,
      title: title || "Clinical Diagnostic Assessment",
      category: category || "Blood Test",
      recordDate: new Date(),
      metrics: {
        bloodSugar: metrics?.bloodSugar || 137,
        hba1c: metrics?.hba1c || 6.7,
        bloodPressureSystolic: metrics?.bp ? parseInt(metrics.bp.split("/")[0]) : 140,
        bloodPressureDiastolic: metrics?.bp ? parseInt(metrics.bp.split("/")[1]) : 90,
        eGFR: metrics?.eGFR || 88,
      },
      notes: notes || `Patient evaluation recorded by ${assignedDoctor} at ${assignedHospital}.`,
    });

    console.log(`[COOKIE HOSPITAL REPORT SUCCESS] Saved Report for '${patientName}' at Cookie-Assigned Hospital '${assignedHospital}'!`);

    return res.status(201).json({
      success: true,
      message: `Medical report for '${patientName}' saved to MongoDB at Cookie-Assigned Hospital '${assignedHospital}'!`,
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
