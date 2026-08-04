const Citizen = require("../models/Citizen");
const MedicalReport = require("../models/MedicalReport");
const Patient = require("../models/Patient");

/**
 * @desc    Register a Newborn / Citizen in National Health Repository
 * @route   POST /api/citizens (or POST /api/citizen/register)
 * @access  Authenticated Hospital Staff
 */
exports.registerCitizen = async (req, res, next) => {
  try {
    const {
      fullName,
      name,
      birthCertificateNumber,
      healthId,
      dob,
      gender,
      bloodGroup,
      fatherName,
      motherName,
      phone,
      province,
      district,
      city,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
    } = req.body;

    const targetName = (fullName || name || "").trim();

    // 1. Validations
    if (!targetName) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Full Name is required.",
      });
    }

    if (!birthCertificateNumber || !birthCertificateNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Birth Certificate Number is required.",
      });
    }

    if (!dob) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Date of Birth is required.",
      });
    }

    if (!gender || !gender.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Gender is required.",
      });
    }

    const cleanCert = birthCertificateNumber.trim();

    // 2. Check Uniqueness of Birth Certificate Number
    const existingCert = await Citizen.findOne({ birthCertificateNumber: cleanCert });
    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: `Birth Certificate Number '${cleanCert}' is already registered in the system.`,
      });
    }

    // 3. Auto-generate Unique Health ID if not provided
    let finalHealthId = (healthId || "").trim();
    if (!finalHealthId) {
      const year = new Date().getFullYear();
      const random4 = Math.floor(1000 + Math.random() * 9000);
      finalHealthId = `NP-${year}-${random4}`;
    }

    const existingHealthId = await Citizen.findOne({ healthId: finalHealthId });
    if (existingHealthId) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      finalHealthId = `NP-2026-${random4}`;
    }

    // 4. Save Newborn into Citizen Collection
    const newCitizen = await Citizen.create({
      fullName: targetName,
      name: targetName,
      birthCertificateNumber: cleanCert,
      healthId: finalHealthId,
      dob: new Date(dob),
      gender: gender.trim(),
      bloodGroup: bloodGroup || "Unknown",
      parentDetails: {
        fatherName: fatherName ? fatherName.trim() : "",
        motherName: motherName ? motherName.trim() : "",
      },
      phone: phone ? phone.trim() : "+977-9841234567",
      address: {
        province: province ? province.trim() : "Bagmati Province",
        district: district ? district.trim() : "Kathmandu",
        city: city ? city.trim() : "Kathmandu",
      },
      emergencyContact: {
        name: emergencyContactName ? emergencyContactName.trim() : (fatherName || "Parent"),
        phone: emergencyContactPhone ? emergencyContactPhone.trim() : "+977-9801987654",
        relation: emergencyContactRelation ? emergencyContactRelation.trim() : "Parent",
      },
      createdAt: new Date(),
    });

    console.log(`[NEWBORN REGISTRATION SUCCESS] Registered Newborn '${newCitizen.fullName}' (Health ID: ${newCitizen.healthId})!`);

    return res.status(201).json({
      success: true,
      message: `Newborn '${newCitizen.fullName}' successfully registered with National Health ID '${newCitizen.healthId}'!`,
      citizen: newCitizen,
    });
  } catch (error) {
    console.error("[REGISTER CITIZEN ERROR]", error);
    next(error);
  }
};

/**
 * @desc    Patient Lookup by Birth Certificate Number for Medical Record Form
 * @route   GET /api/citizens/lookup?birthCertificateNumber=...
 */
exports.lookupCitizen = async (req, res, next) => {
  try {
    const { birthCertificateNumber, healthId } = req.query;
    const targetCert = (birthCertificateNumber || healthId || "").trim();

    if (!targetCert) {
      return res.status(400).json({
        success: false,
        found: false,
        message: "Please provide a Birth Certificate Number to perform lookup.",
      });
    }

    const citizenDoc = await Citizen.findOne({
      $or: [
        { birthCertificateNumber: targetCert },
        { birthCertificateNumber: { $regex: targetCert, $options: "i" } },
        { healthId: targetCert },
      ],
    });

    if (!citizenDoc) {
      return res.status(404).json({
        success: false,
        found: false,
        message: "Citizen not found. Please register the newborn first.",
      });
    }

    // Calculate age from DOB
    const birthYear = new Date(citizenDoc.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - birthYear);

    const addressStr = `${citizenDoc.address?.city || "Kathmandu"}, ${citizenDoc.address?.district || "Kathmandu"}, ${citizenDoc.address?.province || "Bagmati Province"}`;

    return res.status(200).json({
      success: true,
      found: true,
      citizen: {
        _id: citizenDoc._id,
        fullName: citizenDoc.fullName || citizenDoc.name,
        name: citizenDoc.fullName || citizenDoc.name,
        dob: citizenDoc.dob ? citizenDoc.dob.toISOString().split("T")[0] : "2026-01-01",
        age,
        gender: citizenDoc.gender,
        bloodGroup: citizenDoc.bloodGroup,
        address: addressStr,
        healthId: citizenDoc.healthId,
        birthCertificateNumber: citizenDoc.birthCertificateNumber,
        phone: citizenDoc.phone,
      },
    });
  } catch (error) {
    console.error("[LOOKUP CITIZEN ERROR]", error);
    next(error);
  }
};

/**
 * @desc    Fetch Citizen Profile from MongoDB Database
 * @route   GET /api/citizen/profile/:healthId
 */
exports.getCitizenProfile = async (req, res, next) => {
  try {
    const { healthId } = req.params;
    let citizen = await Citizen.findOne({
      $or: [{ healthId }, { birthCertificateNumber: healthId }],
    });

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      citizen,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch Citizen Timeline from MongoDB
 * @route   GET /api/citizen/timeline/:healthId
 */
exports.getCitizenTimeline = async (req, res, next) => {
  try {
    const { healthId } = req.params;
    const reports = await MedicalReport.find({
      $or: [{ healthId }, { birthCertificateNumber: healthId }],
    }).sort({ recordDate: -1 });

    return res.status(200).json({
      success: true,
      healthId,
      count: reports.length,
      timeline: reports,
    });
  } catch (error) {
    next(error);
  }
};
