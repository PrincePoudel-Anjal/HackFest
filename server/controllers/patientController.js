const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const Citizen = require("../models/Citizen");
const Hospital = require("../models/Hospital");
const MedicalReport = require("../models/MedicalReport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/**
 * Helper to calculate accurate age from DOB
 */
function calculateExactAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * @desc    POST /api/patient/login
 *          Patient logs in using Birth Certificate Number or Health ID
 *          Stores citizenId, healthId, birthCertificateNumber inside JWT payload
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

    // 1. Find Citizen Document in MongoDB
    const citizenDoc = await Citizen.findOne({
      $or: [
        { birthCertificateNumber: cleanCert },
        { birthCertificateNumber: { $regex: cleanCert, $options: "i" } },
        { healthId: cleanCert },
        { healthId: { $regex: cleanCert, $options: "i" } },
      ],
    });

    if (!citizenDoc) {
      return res.status(404).json({
        success: false,
        message: `No citizen profile found for Birth Certificate Number '${cleanCert}'. Please register the newborn first.`,
      });
    }

    const age = calculateExactAge(citizenDoc.dob);
    const addressStr = `${citizenDoc.address?.city || "Kathmandu"}, ${citizenDoc.address?.district || "Kathmandu"}, ${citizenDoc.address?.province || "Bagmati Province"}`;

    // 2. Generate JWT containing citizenId, healthId, birthCertificateNumber
    const token = jwt.sign(
      {
        citizenId: citizenDoc._id,
        id: citizenDoc._id,
        healthId: citizenDoc.healthId,
        birthCertificateNumber: citizenDoc.birthCertificateNumber,
        role: "Patient",
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("patientToken", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      success: true,
      message: `Welcome ${citizenDoc.fullName || citizenDoc.name}! Medical history loaded.`,
      token,
      patient: {
        _id: citizenDoc._id,
        citizenId: citizenDoc._id,
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
    const citizenId = req.user?.citizenId || req.user?.id;
    const birthCert = (req.query.birthCertificateNumber || req.params.birthCert || req.user?.birthCertificateNumber || "BC-2080-94812").trim();

    let citizenDoc = null;
    if (citizenId) {
      citizenDoc = await Citizen.findById(citizenId);
    }
    if (!citizenDoc) {
      citizenDoc = await Citizen.findOne({
        $or: [
          { birthCertificateNumber: birthCert },
          { birthCertificateNumber: { $regex: birthCert, $options: "i" } },
          { healthId: birthCert },
        ],
      });
    }

    if (!citizenDoc) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const age = calculateExactAge(citizenDoc.dob);
    const addressStr = `${citizenDoc.address?.city || "Kathmandu"}, ${citizenDoc.address?.district || "Kathmandu"}, ${citizenDoc.address?.province || "Bagmati Province"}`;

    return res.status(200).json({
      success: true,
      patient: {
        _id: citizenDoc._id,
        citizenId: citizenDoc._id,
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
 * @desc    GET /api/patient/records & GET /api/medical-records
 *          Reads citizenId from req.user / JWT payload or query param and returns all medical records sorted by visitDate descending
 *          Deduplicates records across collections using fingerprint matching
 */
exports.getPatientRecords = async (req, res, next) => {
  try {
    const userCitizenId = req.user?.citizenId || req.user?.id;
    const userBirthCert = (req.user?.birthCertificateNumber || req.query.birthCertificateNumber || req.query.healthId || "").trim();

    let searchConditions = [];

    if (userCitizenId) {
      searchConditions.push({ citizenId: userCitizenId });
    }

    if (userBirthCert) {
      searchConditions.push({ birthCertificateNumber: userBirthCert });
      searchConditions.push({ birthCertificateNumber: { $regex: userBirthCert, $options: "i" } });
      searchConditions.push({ healthId: userBirthCert });
    }

    // Resolve citizen document if needed
    if (searchConditions.length === 0) {
      return res.status(200).json({ success: true, count: 0, records: [] });
    }

    const citizenDoc = await Citizen.findOne({ $or: searchConditions });

    if (citizenDoc) {
      searchConditions.push({ citizenId: citizenDoc._id });
      if (citizenDoc.birthCertificateNumber) {
        searchConditions.push({ birthCertificateNumber: citizenDoc.birthCertificateNumber });
        searchConditions.push({ birthCertificateNumber: { $regex: citizenDoc.birthCertificateNumber, $options: "i" } });
      }
      if (citizenDoc.healthId) {
        searchConditions.push({ healthId: citizenDoc.healthId });
      }
    }

    const query = { $or: searchConditions };

    // 1. Fetch from MedicalRecord (primary collection)
    const medicalRecords = await MedicalRecord.find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("hospitalId", "hospitalName location");

    // 2. Fetch from Patient (fallback collection)
    const patientRecords = await Patient.find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("hospitalId", "hospitalName location");

    // 3. Fetch from MedicalReport (fallback collection)
    const reportRecords = await MedicalReport.find(query)
      .sort({ recordDate: -1, createdAt: -1 });

    // Deduplicate records using fingerprint hash map
    const combinedMap = new Map();

    const getFingerprint = (rec) => {
      const diag = (rec.diagnosis || rec.title || "").toLowerCase().trim();
      const sym = (rec.symptoms || "").toLowerCase().trim();
      const doc = (rec.assignedDoctor || rec.doctor || "").toLowerCase().trim();
      const hosp = (rec.hospitalName || rec.assignedHospital || "").toLowerCase().trim();
      const vDate = rec.visitDate || rec.recordDate || rec.createdAt;
      const dateStr = vDate ? new Date(vDate).toISOString().slice(0, 10) : "2026-08-04";
      return `${diag}|${sym}|${doc}|${hosp}|${dateStr}`;
    };

    medicalRecords.forEach((m) => {
      const fp = getFingerprint(m);
      if (!combinedMap.has(fp)) {
        combinedMap.set(fp, {
          _id: m._id,
          citizenId: m.citizenId,
          healthId: m.healthId,
          birthCertificateNumber: m.birthCertificateNumber,
          hospitalId: m.hospitalId?._id || m.hospitalId,
          hospitalName: m.hospitalName || m.hospitalId?.hospitalName || "Regional Hospital",
          assignedDoctor: m.assignedDoctor,
          diagnosis: m.diagnosis || "Clinical Diagnostic Assessment",
          symptoms: m.symptoms,
          prescription: m.prescription,
          visitDate: m.visitDate || m.createdAt,
          notes: m.notes,
          createdAt: m.createdAt,
        });
      }
    });

    patientRecords.forEach((p) => {
      const fp = getFingerprint(p);
      if (!combinedMap.has(fp)) {
        combinedMap.set(fp, {
          _id: p._id,
          citizenId: p.citizenId,
          healthId: p.healthId,
          birthCertificateNumber: p.birthCertificateNumber,
          hospitalId: p.hospitalId?._id || p.hospitalId,
          hospitalName: p.hospitalName || p.hospitalId?.hospitalName || "Regional Hospital",
          assignedDoctor: p.assignedDoctor,
          diagnosis: p.diagnosis || "Clinical Diagnostic Assessment",
          symptoms: p.symptoms,
          prescription: p.prescription,
          visitDate: p.visitDate || p.createdAt,
          notes: p.notes,
          createdAt: p.createdAt,
        });
      }
    });

    reportRecords.forEach((r) => {
      const fp = getFingerprint(r);
      if (!combinedMap.has(fp)) {
        combinedMap.set(fp, {
          _id: r._id,
          citizenId: r.citizenId || citizenDoc?._id,
          healthId: r.healthId || citizenDoc?.healthId,
          birthCertificateNumber: r.birthCertificateNumber || citizenDoc?.birthCertificateNumber,
          hospitalId: r.hospitalId,
          hospitalName: r.assignedHospital || r.hospital || "Central Referral Hospital",
          assignedDoctor: r.assignedDoctor || r.doctor || "Attending Physician",
          diagnosis: r.title || r.category || "Diagnostic Assessment",
          symptoms: r.symptoms || "Patient evaluation recorded.",
          prescription: "Metformin 500mg daily, Low sodium diet, 30-min daily exercise",
          visitDate: r.recordDate || r.createdAt,
          notes: r.notes || "",
          createdAt: r.createdAt,
        });
      }
    });

    const allRecords = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
    );

    return res.status(200).json({
      success: true,
      count: allRecords.length,
      records: allRecords,
      data: allRecords,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    POST /api/medical-records and POST /api/patients
 *          Hospital creates a new medical record referencing citizenId (ObjectId)
 */
exports.createPatient = async (req, res, next) => {
  try {
    const {
      birthCertificateNumber,
      healthId,
      symptoms,
      diagnosis,
      prescription,
      assignedDoctor,
      notes,
      visitDate,
    } = req.body;

    const targetCert = (birthCertificateNumber || healthId || "").trim();

    if (!targetCert) {
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

    // 1. Search Citizen Collection in MongoDB
    const citizenDoc = await Citizen.findOne({
      $or: [
        { birthCertificateNumber: targetCert },
        { birthCertificateNumber: { $regex: targetCert, $options: "i" } },
        { healthId: targetCert },
      ],
    });

    if (!citizenDoc) {
      return res.status(400).json({
        success: false,
        message: "Citizen not found. Please register the newborn first.",
      });
    }

    // 2. Extract active hospital node from token cookie or database
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

    const newRecordData = {
      citizenId: citizenDoc._id, // Mongo ObjectId referencing Citizen._id
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
    };

    // 3. Save into MedicalRecord (medicalrecords collection) ONLY as single source of truth
    const newMedicalRecord = await MedicalRecord.create(newRecordData);

    console.log(`[MEDICAL RECORD CREATED SUCCESS] Linked citizenId '${citizenDoc._id}' for '${citizenDoc.fullName}' at '${hospitalDoc.hospitalName || hospitalDoc.name}'!`);

    return res.status(201).json({
      success: true,
      message: `Medical record for '${citizenDoc.fullName}' created under '${hospitalDoc.hospitalName || hospitalDoc.name}'!`,
      patient: newMedicalRecord,
      medicalRecord: newMedicalRecord,
      data: newMedicalRecord,
      citizen: citizenDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    GET /api/patients & GET /api/medical-records/hospital
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

    const records = await MedicalRecord.find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .populate("citizenId", "fullName dob gender bloodGroup address phone")
      .populate("hospitalId", "hospitalName location");

    return res.status(200).json({
      success: true,
      count: records.length,
      patients: records,
      medicalRecords: records,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    PUT /api/patients/:id or PUT /api/medical-records/:id
 */
exports.updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patientRecord = await MedicalRecord.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

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
 * @desc    DELETE /api/patients/:id or DELETE /api/medical-records/:id
 */
exports.deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    await MedicalRecord.findByIdAndDelete(id);
    await Patient.findByIdAndDelete(id);

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

    const records = await MedicalRecord.find({
      $or: [
        { birthCertificateNumber: { $regex: searchCert, $options: "i" } },
        { healthId: { $regex: searchCert, $options: "i" } },
      ],
    }).sort({ visitDate: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      patients: records,
      medicalRecords: records,
    });
  } catch (error) {
    next(error);
  }
};
