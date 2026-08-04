const Citizen = require("../models/Citizen");
const MedicalReport = require("../models/MedicalReport");

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

    // Seed default citizen if DB record not found
    if (!citizen) {
      citizen = await Citizen.create({
        healthId: healthId || "NP-9841-0021",
        fullName: "Ram Kumar Sharma",
        dob: "1983-05-14",
        gender: "Male",
        bloodGroup: "O+",
        phone: "+977-9841234567",
        address: { province: "Bagmati Province", district: "Kathmandu", city: "Kathmandu" },
        emergencyContact: { name: "Sita Sharma", phone: "+977-9801987654", relation: "Spouse" },
      });
      console.log(`[DATABASE SEED] Created Citizen record for Health ID '${healthId}' in MongoDB.`);
    }

    return res.status(200).json({
      success: true,
      citizen,
    });
  } catch (error) {
    console.error("[DATABASE ERROR] Failed to fetch citizen profile:", error);
    next(error);
  }
};

/**
 * @desc    Fetch Citizen Lifelong Medical Timeline from MongoDB Database
 * @route   GET /api/citizen/timeline/:healthId
 */
exports.getCitizenTimeline = async (req, res, next) => {
  try {
    const { healthId } = req.params;
    let reports = await MedicalReport.find({
      $or: [{ healthId }, { birthCertificateNumber: healthId }],
    }).sort({ recordDate: -1 });

    // Seed initial historical reports if empty
    if (reports.length === 0) {
      const initialReports = [
        {
          patientName: "Ram Kumar Sharma",
          birthCertificateNumber: "BC-2080-94812",
          assignedDoctor: "Dr. Anish Shrestha (NMC-22104)",
          symptoms: "Baseline routine health evaluation. Normal fasting blood glucose.",
          assignedHospital: "Patan Hospital, Lalitpur",
          healthId: healthId || "NP-9841-0021",
          title: "Routine Baseline Blood Panel",
          category: "Blood Test",
          recordDate: new Date("2019-04-12"),
          metrics: { bloodSugar: 95, hba1c: 5.4, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, eGFR: 95 },
          notes: "Normal baseline health assessment. No immediate risk factors.",
        },
        {
          patientName: "Ram Kumar Sharma",
          birthCertificateNumber: "BC-2080-94812",
          assignedDoctor: "Dr. Sushil Adhikari (NMC-18492)",
          symptoms: "Mild fatigue, slight elevation in fasting glucose levels.",
          assignedHospital: "Tribhuvan University Teaching Hospital (TUTH)",
          healthId: healthId || "NP-9841-0021",
          title: "Annual Comprehensive Health Checkup",
          category: "Blood Test",
          recordDate: new Date("2021-08-20"),
          metrics: { bloodSugar: 109, hba1c: 5.8, bloodPressureSystolic: 129, bloodPressureDiastolic: 84, eGFR: 93 },
          notes: "Slight elevation in fasting glucose & HbA1c. Dietary counseling advised.",
        },
        {
          patientName: "Ram Kumar Sharma",
          birthCertificateNumber: "BC-2080-94812",
          assignedDoctor: "Dr. Rekha Thapa (NMC-15938)",
          symptoms: "Pre-diabetic glycemic range symptoms. Occasional dizziness.",
          assignedHospital: "Bir Hospital (Central Referral)",
          healthId: healthId || "NP-9841-0021",
          title: "Follow-up Diagnostic Metabolic Lab",
          category: "Blood Test",
          recordDate: new Date("2023-11-05"),
          metrics: { bloodSugar: 129, hba1c: 6.3, bloodPressureSystolic: 134, bloodPressureDiastolic: 88, eGFR: 90 },
          notes: "Pre-diabetic glycemic range. Recommended 30-min daily exercise.",
        },
        {
          patientName: "Ram Kumar Sharma",
          birthCertificateNumber: "BC-2080-94812",
          assignedDoctor: "Dr. Sushil Adhikari (NMC-18492)",
          symptoms: "High fasting blood glucose (137 mg/dL), dry cough & persistent fatigue",
          assignedHospital: "Grande International Hospital",
          healthId: healthId || "NP-9841-0021",
          title: "Comprehensive Metabolic Report",
          category: "Blood Test",
          recordDate: new Date("2024-06-15"),
          metrics: { bloodSugar: 137, hba1c: 6.7, bloodPressureSystolic: 140, bloodPressureDiastolic: 90, eGFR: 88 },
          notes: "Persistent multi-year upward glucose & BP trajectory.",
        },
      ];
      reports = await MedicalReport.insertMany(initialReports);
      console.log(`[DATABASE SEED] Created ${reports.length} historical MedicalReports for '${healthId}' in MongoDB.`);
    }

    return res.status(200).json({
      success: true,
      healthId,
      count: reports.length,
      timeline: reports,
    });
  } catch (error) {
    console.error("[DATABASE ERROR] Failed to fetch citizen timeline:", error);
    next(error);
  }
};
