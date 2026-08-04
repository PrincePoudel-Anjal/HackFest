const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");
const Hospital = require("./models/Hospital");
const Citizen = require("./models/Citizen");
const Patient = require("./models/Patient");
const MedicalReport = require("./models/MedicalReport");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myHakathon";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[SEED] Connected to MongoDB database '${MONGODB_URI}'`);

    // Drop indexes on collections to prevent stale schema index errors
    try { await mongoose.connection.collection("hospitals").dropIndexes(); } catch (e) {}
    try { await mongoose.connection.collection("citizens").dropIndexes(); } catch (e) {}

    // 1. CLEAR EXISTING DATA
    await Admin.deleteMany({});
    await Hospital.deleteMany({});
    await Citizen.deleteMany({});
    await Patient.deleteMany({});
    await MedicalReport.deleteMany({});
    console.log("[SEED] Cleared existing database collections.");

    // 2. SEED ADMIN
    const hashedAdminPassword = await bcrypt.hash("admin", 10);
    const admin = await Admin.create({
      username: "admin",
      password: hashedAdminPassword,
    });
    console.log(`[SEED SUCCESS] Created System Admin: username '${admin.username}' / password 'admin'`);

    // 3. SEED 5 HOSPITALS (5 Doctors per hospital = 25 doctors)
    const rawHospitals = [
      {
        hospitalName: "Pokhara Regional Super Speciality Hospital",
        name: "Pokhara Regional Super Speciality Hospital",
        location: "Pokhara, Gandaki Province",
        username: "pokhara_admin",
        password: await bcrypt.hash("pokhara123", 10),
        doctors: [
          "Dr. Ram Sharma",
          "Dr. Sita Karki",
          "Dr. Binod Gurung",
          "Dr. Anil Gurung",
          "Dr. Pooja Paudel",
        ],
      },
      {
        hospitalName: "Tribhuvan University Teaching Hospital (TUTH)",
        name: "Tribhuvan University Teaching Hospital (TUTH)",
        location: "Maharajgunj, Kathmandu",
        username: "tuth_admin",
        password: await bcrypt.hash("tuth123", 10),
        doctors: [
          "Dr. Sushil Adhikari",
          "Dr. Sunita Karki",
          "Dr. Rajesh Shrestha",
          "Dr. Priya Pokharel",
          "Dr. Bishal Rayamajhi",
        ],
      },
      {
        hospitalName: "Patan Hospital",
        name: "Patan Hospital",
        location: "Lagankhel, Lalitpur",
        username: "patan_admin",
        password: await bcrypt.hash("patan123", 10),
        doctors: [
          "Dr. Anish Shrestha",
          "Dr. Kabita Giri",
          "Dr. Nabin Bhattarai",
          "Dr. Ritu Dahal",
          "Dr. Sunil Khadka",
        ],
      },
      {
        hospitalName: "Bir Hospital (Central Referral)",
        name: "Bir Hospital (Central Referral)",
        location: "Tundikhel, Kathmandu",
        username: "bir_admin",
        password: await bcrypt.hash("bir123", 10),
        doctors: [
          "Dr. Rekha Thapa",
          "Dr. Prakash Sharma",
          "Dr. Deepa Karki",
          "Dr. Madan Joshi",
          "Dr. Archana KC",
        ],
      },
      {
        hospitalName: "Grande International Hospital",
        name: "Grande International Hospital",
        location: "Dhakasi, Kathmandu",
        username: "grande_admin",
        password: await bcrypt.hash("grande123", 10),
        doctors: [
          "Dr. Suman Giri",
          "Dr. Alok Shrestha",
          "Dr. Pratima Poudel",
          "Dr. Roshan Maharjan",
          "Dr. Bikash Thapa",
        ],
      },
    ];

    const seededHospitals = await Hospital.insertMany(rawHospitals);
    console.log(`[SEED SUCCESS] Created ${seededHospitals.length} Hospitals with 25 Doctors total.`);

    // 4. SEED CITIZENS COLLECTION (Registered Citizens / Newborns)
    const rawCitizens = [
      {
        fullName: "Ram Kumar Sharma",
        name: "Ram Kumar Sharma",
        birthCertificateNumber: "BC-2080-94812",
        healthId: "NP-9841-0021",
        dob: new Date("1983-05-14"),
        gender: "Male",
        bloodGroup: "O+",
        parentDetails: { fatherName: "Hari Sharma", motherName: "Gita Sharma" },
        phone: "+977-9841234567",
        address: { province: "Bagmati Province", district: "Kathmandu", city: "Balaju, Kathmandu" },
      },
      {
        fullName: "Sita Kumari Sharma",
        name: "Sita Kumari Sharma",
        birthCertificateNumber: "BC-2080-84910",
        healthId: "NP-9841-0022",
        dob: new Date("1987-09-22"),
        gender: "Female",
        bloodGroup: "A+",
        parentDetails: { fatherName: "Shyam Sharma", motherName: "Laxmi Sharma" },
        phone: "+977-9801987654",
        address: { province: "Bagmati Province", district: "Lalitpur", city: "Lagankhel, Lalitpur" },
      },
      {
        fullName: "Aayush Nepal",
        name: "Aayush Nepal",
        birthCertificateNumber: "BC-2080-73920",
        healthId: "NP-9841-0023",
        dob: new Date("1998-01-10"),
        gender: "Male",
        bloodGroup: "B+",
        parentDetails: { fatherName: "Govinda Nepal", motherName: "Sarita Nepal" },
        phone: "+977-9860112233",
        address: { province: "Gandaki Province", district: "Kaski", city: "Lakeside, Pokhara" },
      },
      {
        fullName: "Pooja Gurung",
        name: "Pooja Gurung",
        birthCertificateNumber: "BC-2080-62819",
        healthId: "NP-9841-0024",
        dob: new Date("1994-11-05"),
        gender: "Female",
        bloodGroup: "AB+",
        parentDetails: { fatherName: "Dhan Gurung", motherName: "Maya Gurung" },
        phone: "+977-9811223344",
        address: { province: "Gandaki Province", district: "Kaski", city: "Mahendrapool, Pokhara" },
      },
      {
        fullName: "Bikash Shrestha",
        name: "Bikash Shrestha",
        birthCertificateNumber: "BC-2080-51708",
        healthId: "NP-9841-0025",
        dob: new Date("1975-03-30"),
        gender: "Male",
        bloodGroup: "O-",
        parentDetails: { fatherName: "Prem Shrestha", motherName: "Radha Shrestha" },
        phone: "+977-9851009988",
        address: { province: "Bagmati Province", district: "Kathmandu", city: "Baneshwor, Kathmandu" },
      },
      {
        fullName: "Kiran Thapa",
        name: "Kiran Thapa",
        birthCertificateNumber: "BC-2080-40697",
        healthId: "NP-9841-0026",
        dob: new Date("1981-08-18"),
        gender: "Male",
        bloodGroup: "A-",
        parentDetails: { fatherName: "Surya Thapa", motherName: "Kamala Thapa" },
        phone: "+977-9841998877",
        address: { province: "Bagmati Province", district: "Chitwan", city: "Bharatpur, Chitwan" },
      },
    ];

    const seededCitizens = await Citizen.insertMany(rawCitizens);
    console.log(`[SEED SUCCESS] Created ${seededCitizens.length} Citizens in 'citizens' collection!`);

    // 5. SEED 30 NORMALIZED PATIENT MEDICAL RECORDS
    const symptomsList = [
      "High fasting blood glucose (139 mg/dL), persistent dry cough & fatigue",
      "Stage 1 Hypertension (142/92 mmHg), mild chest tightness & headache",
      "Acute fever, body aches, severe fatigue & dehydration",
      "Elevated HbA1c (6.8%), pre-diabetic glycemic range & dizziness",
      "Severe migraine headache, joint pain & elevated blood pressure",
      "Chronic abdominal pain, acidity & loss of appetite",
    ];

    const diagnosesList = [
      "Type 2 Diabetes Trajectory Assessment",
      "Essential Hypertension Evaluation",
      "Acute Viral Febrile Illness",
      "Metabolic Glycemic Dysregulation",
      "Hypercholesterolemia & Vascular Assessment",
      "Gastrointestinal Acid Reflux",
    ];

    const prescriptionsList = [
      "Metformin 500mg daily, Low sodium diet, 30-min daily aerobic exercise",
      "Amlodipine 5mg daily, BP self-monitoring twice weekly",
      "Paracetamol 500mg thrice daily, ORS fluids, Bed rest",
      "Glimepiride 1mg daily, Dietary Counseling & sugar tracking",
      "Atorvastatin 10mg daily, Avoid oily/fried foods",
      "Omeprazole 20mg before breakfast, Small frequent meals",
    ];

    const patientRecords = [];

    // Generate 30 records linked to citizenId
    for (let i = 0; i < 30; i++) {
      const hosp = seededHospitals[i % seededHospitals.length];
      const citizen = seededCitizens[i % seededCitizens.length];
      const doctor = hosp.doctors[i % hosp.doctors.length];
      const symptom = symptomsList[i % symptomsList.length];
      const diagnosis = diagnosesList[i % diagnosesList.length];
      const prescription = prescriptionsList[i % prescriptionsList.length];

      const daysAgo = (30 - i) * 15;
      const visitDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      patientRecords.push({
        citizenId: citizen._id,
        healthId: citizen.healthId,
        birthCertificateNumber: citizen.birthCertificateNumber,
        hospitalId: hosp._id,
        hospitalName: hosp.hospitalName,
        assignedDoctor: doctor,
        symptoms: symptom,
        diagnosis: diagnosis,
        prescription: prescription,
        visitDate: visitDate,
        notes: `Clinical evaluation completed by ${doctor} at ${hosp.hospitalName}.`,
        createdAt: visitDate,
      });
    }

    const seededPatients = await Patient.insertMany(patientRecords);
    console.log(`[SEED SUCCESS] Created ${seededPatients.length} Normalized Patient Records linked to Citizens!`);

    console.log("[SEED COMPLETE] All 1 Admin, 5 Hospitals, 25 Doctors, 6 Citizens, and 30 Patient Records seeded successfully into MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("[SEED ERROR]", err);
    process.exit(1);
  }
}

seedDatabase();
