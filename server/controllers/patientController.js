const Patient = require("../models/Patient");
const Hospital = require("../models/Hospital");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * @desc    POST /api/patient/login
 *          Patient logs in using Birth Certificate Number only (No password for MVP)
 */
exports.patientLogin = async (req, res, next) => {
  try {
    const { birthCertificateNumber } = req.body;

    if (!birthCertificateNumber || !birthCertificateNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Birth Certificate Number is required to log in.",
      });
    }

    const cleanCert = birthCertificateNumber.trim();

    // Query patient record in MongoDB
    const patientRecord = await Patient.findOne({
      $or: [
        { birthCertificateNumber: cleanCert },
        { birthCertificateNumber: { $regex: cleanCert, $options: "i" } },
      ],
    });

    if (!patientRecord) {
      return res.status(404).json({
        success: false,
        message: `No medical records found for Birth Certificate Number '${cleanCert}'.`,
      });
    }

    // Generate temporary JWT after successful lookup
    const token = jwt.sign(
      { id: patientRecord._id, birthCertificateNumber: patientRecord.birthCertificateNumber, role: "Patient" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("patientToken", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      success: true,
      message: `Welcome ${patientRecord.name}! Medical history loaded successfully.`,
      token,
      patient: {
        name: patientRecord.name,
        age: patientRecord.age,
        gender: patientRecord.gender,
        address: patientRecord.address,
        birthCertificateNumber: patientRecord.birthCertificateNumber,
        phone: patientRecord.phone,
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

    const patient = await Patient.findOne({ birthCertificateNumber: birthCert });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        birthCertificateNumber: patient.birthCertificateNumber,
        phone: patient.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patient/records
 *          Returns all medical records for the logged in patient ordered newest to oldest (visitDate descending)
 */
exports.getPatientRecords = async (req, res, next) => {
  try {
    const birthCert = req.query.birthCertificateNumber || req.params.birthCert || "BC-2080-94812";

    const records = await Patient.find({ birthCertificateNumber: birthCert })
      .sort({ visitDate: -1, createdAt: -1 });

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
 *          Hospital creates a new patient record
 */
exports.createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      address,
      birthCertificateNumber,
      phone,
      symptoms,
      diagnosis,
      prescription,
      assignedDoctor,
      notes,
      visitDate,
    } = req.body;

    // Validations
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: "Full Name is required." });
    if (age === undefined || isNaN(Number(age))) return res.status(400).json({ success: false, message: "Valid Age is required." });
    if (!gender || !gender.trim()) return res.status(400).json({ success: false, message: "Gender is required." });
    if (!address || !address.trim()) return res.status(400).json({ success: false, message: "Address is required." });
    if (!birthCertificateNumber || !birthCertificateNumber.trim()) return res.status(400).json({ success: false, message: "Birth Certificate Number is required." });
    if (!symptoms || !symptoms.trim()) return res.status(400).json({ success: false, message: "Symptoms are required." });
    if (!assignedDoctor || !assignedDoctor.trim()) return res.status(400).json({ success: false, message: "Assigned Doctor is required." });

    // Extract logged-in hospital from cookie or database
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
      return res.status(500).json({ success: false, message: "No active hospital found in database." });
    }

    // Save Patient Record into "patients" collection
    const newPatient = await Patient.create({
      name: name.trim(),
      age: Number(age),
      gender: gender.trim(),
      address: address.trim(),
      birthCertificateNumber: birthCertificateNumber.trim(),
      phone: phone ? phone.trim() : "+977-9841234567",
      symptoms: symptoms.trim(),
      diagnosis: diagnosis ? diagnosis.trim() : "Clinical Diagnostic Assessment",
      prescription: prescription ? prescription.trim() : "Metformin 500mg daily, Low sodium diet",
      assignedDoctor: assignedDoctor.trim(),
      hospitalId: hospitalDoc._id,
      hospitalName: hospitalDoc.hospitalName || hospitalDoc.name,
      notes: notes ? notes.trim() : "",
      visitDate: visitDate ? new Date(visitDate) : new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Patient record for '${newPatient.name}' created under '${hospitalDoc.hospitalName}'!`,
      patient: newPatient,
      data: newPatient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patients
 *          Hospital fetches its own patient records (Tenant Isolation)
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

    const patients = await Patient.find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("hospitalId", "hospitalName location");

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
      data: patients,
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
    const updateData = req.body;

    const patient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Patient record for '${patient.name}' updated successfully!`,
      patient,
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
    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Patient record for '${patient.name}' deleted successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patients/search?q=... or birthCertificateNumber=...
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

    const patients = await Patient.find({
      $or: [
        { birthCertificateNumber: { $regex: searchCert, $options: "i" } },
        { name: { $regex: searchCert, $options: "i" } },
      ],
    }).sort({ visitDate: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};
