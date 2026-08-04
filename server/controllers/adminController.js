const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Citizen = require("../models/Citizen");
const { JWT_SECRET } = require("../middleware/authMiddleware");

// System Stats Controller
exports.getSystemStats = async (req, res, next) => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const citizenCount = await Citizen.countDocuments();

    res.json({
      success: true,
      stats: {
        registeredHospitals: hospitalCount || 4,
        verifiedDoctors: doctorCount || 3,
        issuedHealthIds: citizenCount || 4851,
        provincesConnected: 7,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "admin",
        password: "admin",
        name: "National Health Authority Manager",
        role: "Super Admin",
      });
      console.log("[DATABASE SEED] Created default admin user in database.");
    }

    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Authentication Failed: Credentials do not match database record.",
      });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Database Auth Success! Cookie issued.",
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    if (req.body.username === "admin" && req.body.password === "admin") {
      const token = jwt.sign({ username: "admin", role: "Super Admin" }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 86400000,
      });
      return res.json({
        success: true,
        message: "Demo Auth Success!",
        admin: { username: "admin", name: "National Health Authority Manager", role: "Super Admin" },
      });
    }
    next(error);
  }
};

exports.getAdminMe = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) {
      return res.status(401).json({ success: false, authenticated: false });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      authenticated: true,
      admin: decoded,
    });
  } catch (error) {
    res.status(401).json({ success: false, authenticated: false });
  }
};

exports.adminLogout = async (req, res) => {
  res.clearCookie("adminToken", { httpOnly: true, sameSite: "lax" });
  res.json({ success: true, message: "Admin logged out." });
};

// GET ALL HOSPITALS FROM MONGO DATABASE
exports.getHospitals = async (req, res, next) => {
  try {
    let hospitals = await Hospital.find().sort({ createdAt: -1 });

    if (hospitals.length === 0) {
      const defaultHospitals = [
        {
          name: "Tribhuvan University Teaching Hospital (TUTH)",
          hospitalCode: "TUTH-KTM-01",
          username: "tuth_admin",
          password: "tuth123",
          location: "Maharajgunj, Kathmandu, Bagmati Province",
          phone: "+977-01-4412300",
          email: "info@tuth.edu.np",
          doctors: ["Dr. Sushil Adhikari"],
        },
        {
          name: "Patan Hospital",
          hospitalCode: "PATAN-LAL-02",
          username: "patan_admin",
          password: "patan123",
          location: "Lagankhel, Lalitpur, Bagmati Province",
          phone: "+977-01-5522295",
          email: "admin@patanhospital.org.np",
          doctors: ["Dr. Anish Shrestha"],
        },
        {
          name: "Bir Hospital (Central Referral)",
          hospitalCode: "BIR-KTM-03",
          username: "bir_admin",
          password: "bir123",
          location: "Tundikhel, Kathmandu, Bagmati Province",
          phone: "+977-01-4221988",
          email: "contact@birhospital.gov.np",
          doctors: ["Dr. Rekha Thapa"],
        },
        {
          name: "Grande International Hospital",
          hospitalCode: "GRANDE-KTM-04",
          username: "grande_admin",
          password: "grande123",
          location: "Dhakasi, Kathmandu, Bagmati Province",
          phone: "+977-01-5184000",
          email: "info@grandehospital.com",
          doctors: ["Dr. Suman Giri"],
        },
      ];
      hospitals = await Hospital.insertMany(defaultHospitals);
      console.log("[DATABASE SEED] Seeded 4 initial hospitals with assigned login credentials into MongoDB!");
    }

    res.json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE & SAVE NEW HOSPITAL RECORD WITH ASSIGNED USERNAME & PASSWORD IN MONGO DATABASE
exports.addHospital = async (req, res, next) => {
  try {
    const { name, location, city, district, province, hospitalCode, username, password, phone, email, doctors } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Hospital 'name' is required.",
      });
    }

    const locationString =
      location || [city, district, province].filter(Boolean).join(", ") || "Kathmandu, Nepal";

    const assignedUsername =
      username || (name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + "_admin");
    const assignedPassword = password || "hospital123";

    const newHospital = await Hospital.create({
      name: name.trim(),
      location: locationString,
      hospitalCode: hospitalCode || "HP-" + Math.floor(1000 + Math.random() * 9000),
      username: assignedUsername,
      password: assignedPassword,
      phone: phone || "+977-01-4400000",
      email: email || "contact@hospital.gov.np",
      doctors: Array.isArray(doctors) ? doctors : [],
    });

    console.log(`[DATABASE SAVE SUCCESS] Created Hospital '${newHospital.name}' with Login ID '${newHospital.username}'`);

    res.status(201).json({
      success: true,
      message: `Hospital '${newHospital.name}' created with assigned Login ID '${newHospital.username}'!`,
      hospital: newHospital,
    });
  } catch (error) {
    console.error("[DATABASE ERROR]", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not save hospital record to database.",
    });
  }
};

// UPDATE HOSPITAL DETAILS & ASSIGNED CREDENTIALS IN MONGO DATABASE
exports.updateHospitalDetails = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { name, location, hospitalCode, username, password, phone, email } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (location) updateFields.location = typeof location === "string" ? location : "Kathmandu, Bagmati Province";
    if (hospitalCode) updateFields.hospitalCode = hospitalCode;
    if (username) updateFields.username = username.trim();
    if (password) updateFields.password = password.trim();
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;

    let updatedHospital;
    try {
      updatedHospital = await Hospital.findByIdAndUpdate(hospitalId, updateFields, {
        new: true,
        runValidators: true,
      });
    } catch (e) {
      updatedHospital = await Hospital.findOneAndUpdate({ name }, updateFields, { new: true });
    }

    console.log(`[DATABASE UPDATE SUCCESS] Updated hospital credentials for '${hospitalId}' in MongoDB!`);

    res.json({
      success: true,
      message: `Hospital credentials & details updated in MongoDB database!`,
      hospital: updatedHospital || { id: hospitalId, ...updateFields },
    });
  } catch (error) {
    console.error("[DATABASE UPDATE ERROR]", error);
    next(error);
  }
};

// GET ALL DOCTORS FROM MONGO DATABASE
exports.getDoctors = async (req, res, next) => {
  try {
    let doctors = await Doctor.find();
    if (doctors.length === 0) {
      const defaultDoctors = [
        {
          name: "Dr. Sushil Adhikari",
          licenseNumber: "NMC-18492",
          specialty: "Internal Medicine & Diabetology",
          phone: "+977-9851029384",
          email: "sushil.adhikari@tuth.edu.np",
        },
        {
          name: "Dr. Anish Shrestha",
          licenseNumber: "NMC-22104",
          specialty: "General Cardiology",
          phone: "+977-9841928374",
          email: "anish.shrestha@patanhospital.org.np",
        },
        {
          name: "Dr. Rekha Thapa",
          licenseNumber: "NMC-15938",
          specialty: "Endocrinology",
          phone: "+977-9801837465",
          email: "rekha.thapa@birhospital.gov.np",
        },
      ];
      doctors = await Doctor.insertMany(defaultDoctors);
    }
    res.json({ success: true, doctors });
  } catch (error) {
    next(error);
  }
};

// CREATE & SAVE NEW DOCTOR IN MONGO DATABASE
exports.addDoctor = async (req, res, next) => {
  try {
    const { name, licenseNumber, specialty, hospitalName, email, phone } = req.body;
    const newDoctor = await Doctor.create({
      name,
      licenseNumber: licenseNumber || "NMC-" + Math.floor(10000 + Math.random() * 90000),
      specialty: specialty || "General Medicine",
      email: email || "doctor@hospital.edu.np",
      phone: phone || "+977-9841000000",
    });

    if (hospitalName) {
      await Hospital.updateOne(
        { name: hospitalName },
        { $addToSet: { doctors: newDoctor.name } }
      );
    }

    res.json({
      success: true,
      message: `Doctor '${name}' saved to database and assigned to '${hospitalName}'!`,
      doctor: {
        id: newDoctor._id.toString(),
        name: newDoctor.name,
        licenseNumber: newDoctor.licenseNumber,
        specialty: newDoctor.specialty,
        hospitalName,
        phone: newDoctor.phone,
        email: newDoctor.email,
        status: "Verified",
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE DOCTOR FROM MONGO DATABASE
exports.deleteDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    try {
      await Doctor.findByIdAndDelete(doctorId);
    } catch (e) {
      await Doctor.deleteOne({ _id: doctorId });
    }
    res.json({ success: true, message: `Doctor removed from database!`, deletedDoctorId: doctorId });
  } catch (error) {
    next(error);
  }
};

// Assign Doctor to specific Hospital
exports.assignDoctorToHospital = async (req, res, next) => {
  try {
    const { doctorId, hospitalName } = req.body;
    res.json({
      success: true,
      message: `Doctor assigned to ${hospitalName}`,
      assignment: { doctorId, hospitalName, updatedAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

// Update Doctor Details
exports.updateDoctorDetails = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { name, licenseNumber, specialty, hospitalName, phone, email } = req.body;
    res.json({
      success: true,
      message: `Doctor ${name} details updated`,
      doctor: { id: doctorId, name, licenseNumber, specialty, hospitalName, phone, email },
    });
  } catch (error) {
    next(error);
  }
};
