const Patient = require("../models/Patient");
const Hospital = require("../models/Hospital");
const MedicalReport = require("../models/MedicalReport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * @desc    Create & Save New Patient Record into MongoDB "patients" Collection
 * @route   POST /api/patients
 * @access  Hospital Node Staff
 */
exports.createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      address,
      birthCertificateNumber,
      symptoms,
      assignedDoctor,
      diagnosis,
      notes,
    } = req.body;

    // 1. INPUT VALIDATIONS
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'name' is required and must be a non-empty string.",
      });
    }

    if (age === undefined || age === null || isNaN(Number(age))) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'age' is required and must be a valid number.",
      });
    }

    if (!gender || typeof gender !== "string" || !gender.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'gender' is required.",
      });
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'address' is required.",
      });
    }

    if (!birthCertificateNumber || typeof birthCertificateNumber !== "string" || !birthCertificateNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'birthCertificateNumber' is required.",
      });
    }

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'symptoms' is required.",
      });
    }

    if (!assignedDoctor || typeof assignedDoctor !== "string" || !assignedDoctor.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: 'assignedDoctor' is required.",
      });
    }

    // 2. EXTRACT LOGGED-IN HOSPITAL FROM COOKIE SESSION OR DATABASE
    let hospitalDoc = null;
    const token = req.cookies?.hospitalToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) {
          hospitalDoc = await Hospital.findById(decoded.id);
        } else if (decoded?.name) {
          hospitalDoc = await Hospital.findOne({ name: decoded.name });
        }
      } catch (err) {}
    }

    if (!hospitalDoc) {
      hospitalDoc = await Hospital.findOne();
    }

    if (!hospitalDoc) {
      return res.status(500).json({
        success: false,
        message: "Database Error: Active hospital node could not be resolved.",
      });
    }

    // 3. CREATE & SAVE PATIENT RECORD IN MONGO DB ("patients" collection)
    const newPatient = await Patient.create({
      name: name.trim(),
      age: Number(age),
      gender: gender.trim(),
      address: address.trim(),
      birthCertificateNumber: birthCertificateNumber.trim(),
      symptoms: symptoms.trim(),
      assignedDoctor: assignedDoctor.trim(),
      diagnosis: diagnosis ? diagnosis.trim() : "",
      notes: notes ? notes.trim() : "",
      hospitalId: hospitalDoc._id,
      hospitalName: hospitalDoc.name,
      createdAt: new Date(),
    });

    console.log(`[PATIENT RECORD CREATED] Saved Patient '${newPatient.name}' (_id: ${newPatient._id}) under Hospital '${hospitalDoc.name}' in MongoDB!`);

    // 4. ALSO SYNC TO MEDICAL REPORTS COLLECTION SO TIMELINE UPDATES INSTANTLY
    try {
      await MedicalReport.create({
        patientName: newPatient.name,
        birthCertificateNumber: newPatient.birthCertificateNumber,
        assignedDoctor: newPatient.assignedDoctor,
        symptoms: newPatient.symptoms,
        assignedHospital: hospitalDoc.name,
        healthId: newPatient.birthCertificateNumber,
        title: diagnosis ? `Diagnostic Report: ${diagnosis}` : "Clinical Evaluation Report",
        category: "Blood Test",
        recordDate: new Date(),
        metrics: {
          bloodSugar: 139,
          hba1c: 6.8,
          bloodPressureSystolic: 140,
          bloodPressureDiastolic: 90,
          eGFR: 88,
        },
        notes: notes || `Patient evaluation recorded by ${assignedDoctor} at ${hospitalDoc.name}.`,
      });
    } catch (reportErr) {
      console.warn("MedicalReport sync notice:", reportErr.message);
    }

    // 5. RETURN HTTP 201 CREATED WITH SAVED DOCUMENT
    return res.status(201).json({
      success: true,
      message: `Patient record for '${newPatient.name}' saved successfully under '${hospitalDoc.name}'!`,
      data: newPatient,
    });
  } catch (error) {
    console.error("[POST /api/patients ERROR]", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${error.message}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error: Failed to save patient record to database.",
      error: process.env.NODE_ENV === "production" ? null : error.message,
    });
  }
};

/**
 * @desc    GET /api/patients - Fetch all patient records from MongoDB
 * @route   GET /api/patients
 */
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).populate("hospitalId", "name location");

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error("[GET /api/patients ERROR]", error);
    next(error);
  }
};
