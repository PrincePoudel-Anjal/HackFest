const Patient = require("../models/Patient");
const Citizen = require("../models/Citizen");
const Hospital = require("../models/Hospital");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * @desc    POST /api/patient/login
 *          Patient logs in using Birth Certificate Number only
 */
exports.patientLogin = async (req, res, next) => {
  try {
    const { birthCertificateNumber, healthId } = req.body;
    const cleanCert = (birthCertificateNumber || healthId || "").trim();

    if (!cleanCert) {
      return res.status(400).json({
        success: false,
        message: "Birth Certificate Number or Health ID is required to log in.",
      });
    }

    // 1. Fetch Citizen Profile
    const citizenDoc = await Citizen.findOne({
      $or: [
        { birthCertificateNumber: cleanCert },
        { healthId: cleanCert },
      ],
    });

    if (!citizenDoc) {
      return res.status(404).json({
        success: false,
        message: `No citizen profile found for Birth Certificate Number '${cleanCert}'.`,
      });
    }

    // Calculate age from DOB
    const birthYear = new Date(citizenDoc.dob).getFullYear();
    const age = Math.max(0, new Date().getFullYear() - birthYear);
    const addressStr = `${citizenDoc.address?.city || "Kathmandu"}, ${citizenDoc.address?.district || "Kathmandu"}, ${citizenDoc.address?.province || "Bagmati Province"}`;

    const token = jwt.sign(
      { id: citizenDoc._id, birthCertificateNumber: citizenDoc.birthCertificateNumber, role: "Patient" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("patientToken", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      success: true,
      message: `Welcome ${citizenDoc.fullName || citizenDoc.name}! Medical history loaded.`,
      token,
      patient: {
        _id: citizenDoc._id,
        name: citizenDoc.fullName || citizenDoc.name,
        fullName: citizenDoc.fullName || citizenDoc.name,
        age,
        dob: citizenDoc.dob ? citizenDoc.dob.toISOString().split("T")[0] : "2026-01-01",
        gender: citizenDoc.gender,
        bloodGroup: citizenDoc.bloodGroup,
        address: addressStr,
        birthCertificateNumber: citizenDoc.birthCertificateNumber,
        healthId: citizenDoc.healthId,
        phone: citizenDoc.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patient/profile
 */
exports.getPatientProfile = async (req, res, next) => {
  try {
    const birthCert = req.query.birthCertificateNumber || req.params.birthCert || "BC-2080-94812";

    const citizenDoc = await Citizen.findOne({
      $or: [{ birthCertificateNumber: birthCert }, { healthId: birthCert }],
    });

    if (!citizenDoc) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const birthYear = new Date(citizenDoc.dob).getFullYear();
    const age = Math.max(0, new Date().getFullYear() - birthYear);
    const addressStr = `${citizenDoc.address?.city || "Kathmandu"}, ${citizenDoc.address?.district || "Kathmandu"}, ${citizenDoc.address?.province || "Bagmati Province"}`;

    return res.status(200).json({
      success: true,
      patient: {
        _id: citizenDoc._id,
        name: citizenDoc.fullName || citizenDoc.name,
        age,
        gender: citizenDoc.gender,
        address: addressStr,
        birthCertificateNumber: citizenDoc.birthCertificateNumber,
        healthId: citizenDoc.healthId,
        phone: citizenDoc.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patient/records
 *          Returns all medical records for the logged-in patient ordered chronologically (newest to oldest)
 */
exports.getPatientRecords = async (req, res, next) => {
  try {
    const birthCert = req.query.birthCertificateNumber || req.params.birthCert || "BC-2080-94812";

    const records = await Patient.find({
      $or: [{ birthCertificateNumber: birthCert }, { healthId: birthCert }],
    }).sort({ visitDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    POST /api/patients
 *          Hospital creates a new normalized medical record linked to an existing citizen
 */
exports.createPatient = async (req, res, next) => {
  try {
    const {
      birthCertificateNumber,
      symptoms,
      diagnosis,
      prescription,
      assignedDoctor,
      notes,
      visitDate,
    } = req.body;

    // 1. Validations
    if (!birthCertificateNumber || !birthCertificateNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Birth Certificate Number is required.",
      });
    }

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Symptoms are required.",
      });
    }

    if (!assignedDoctor || !assignedDoctor.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Assigned Doctor is required.",
      });
    }

    const cleanCert = birthCertificateNumber.trim();

    // 2. Lookup Citizen in Database
    const citizenDoc = await Citizen.findOne({
      $or: [{ birthCertificateNumber: cleanCert }, { healthId: cleanCert }],
    });

    if (!citizenDoc) {
      return res.status(400).json({
        success: false,
        message: "Citizen not found. Please register the newborn first.",
      });
    }

    // 3. Extract logged-in hospital node from cookie or database
    let hospitalDoc = null;
    const token = req.cookies?.hospitalToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) hospitalDoc = await Hospital.findById(decoded.id);
        else if (decoded?.name) hospitalDoc = await Hospital.findOne({ name: decoded.name });
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

    // 4. Create Normalized Patient Medical Record
    const newPatientRecord = await Patient.create({
      citizenId: citizenDoc._id,
      healthId: citizenDoc.healthId,
      birthCertificateNumber: citizenDoc.birthCertificateNumber,
      hospitalId: hospitalDoc._id,
      hospitalName: hospitalDoc.hospitalName || hospitalDoc.name,
      assignedDoctor: assignedDoctor.trim(),
      symptoms: symptoms.trim(),
      diagnosis: diagnosis ? diagnosis.trim() : "Clinical Diagnostic Assessment",
      prescription: prescription ? prescription.trim() : "Metformin 500mg daily, Low sodium diet",
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      notes: notes ? notes.trim() : "",
      createdAt: new Date(),
    });

    console.log(`[NORMALIZED MEDICAL RECORD SAVED] Saved visit for '${citizenDoc.fullName}' at '${hospitalDoc.name}'!`);

    return res.status(201).json({
      success: true,
      message: `Medical record for '${citizenDoc.fullName}' created under '${hospitalDoc.hospitalName}'!`,
      patient: newPatientRecord,
      data: newPatientRecord,
      citizen: citizenDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patients
 *          Hospital fetches its own patient records
 */
exports.getPatients = async (req, res, next) => {
  try {
    let query = {};
    const token = req.cookies?.hospitalToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) query.hospitalId = decoded.id;
      } catch (err) {}
    }

    const patientRecords = await Patient.find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("citizenId", "fullName dob gender bloodGroup address phone")
      .populate("hospitalId", "hospitalName location");

    return res.status(200).json({
      success: true,
      count: patientRecords.length,
      patients: patientRecords,
      data: patientRecords,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    PUT /api/patients/:id - Update Patient Record
 */
exports.updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patientRecord = await Patient.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!patientRecord) {
      return res.status(404).json({ success: false, message: "Medical record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully!",
      patient: patientRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    DELETE /api/patients/:id - Delete Patient Record
 */
exports.deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patientRecord = await Patient.findByIdAndDelete(id);

    if (!patientRecord) {
      return res.status(404).json({ success: false, message: "Medical record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Medical record deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patients/search?q=...
 */
exports.searchPatients = async (req, res, next) => {
  try {
    const { q, birthCertificateNumber } = req.query;
    const searchCert = birthCertificateNumber || q;

    if (!searchCert) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search term or birthCertificateNumber.",
      });
    }

    const patientRecords = await Patient.find({
      $or: [
        { birthCertificateNumber: { $regex: searchCert, $options: "i" } },
        { healthId: { $regex: searchCert, $options: "i" } },
      ],
    }).sort({ visitDate: -1 });

    return res.status(200).json({
      success: true,
      count: patientRecords.length,
      patients: patientRecords,
    });
  } catch (error) {
    next(error);
  }
};
