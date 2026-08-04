const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");
const Hospital = require("./models/Hospital");
const Patient = require("./models/Patient");
const MedicalReport = require("./models/MedicalReport");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myHakathon";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[SEED] Connected to MongoDB database '${MONGODB_URI}'`);

    // Drop indexes on hospitals collection to avoid old index conflicts
    try {
      await mongoose.connection.collection("hospitals").dropIndexes();
    } catch (e) {}

    // 1. CLEAR EXISTING DATA
    await Admin.deleteMany({});
    await Hospital.deleteMany({});
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

    // 4. SEED 30 PATIENT RECORDS
    const patientTemplates = [
      { name: "Ram Kumar Sharma", birthCert: "BC-2080-94812", gender: "Male", age: 43, address: "Balaju, Kathmandu" },
      { name: "Sita Kumari Sharma", birthCert: "BC-2080-84910", gender: "Female", age: 39, address: "Lagankhel, Lalitpur" },
      { name: "Aayush Nepal", birthCert: "BC-2080-73920", gender: "Male", age: 28, address: "Lakeside, Pokhara" },
      { name: "Pooja Gurung", birthCert: "BC-2080-62819", gender: "Female", age: 32, address: "Mahendrapool, Pokhara" },
      { name: "Bikash Shrestha", birthCert: "BC-2080-51708", gender: "Male", age: 51, address: "Baneshwor, Kathmandu" },
      { name: "Kiran Thapa", birthCert: "BC-2080-40697", gender: "Male", age: 45, address: "Chitwan, Bagmati" },
    ];

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

    // Generate 30 records distributed across 5 hospitals
    for (let i = 0; i < 30; i++) {
      const hosp = seededHospitals[i % seededHospitals.length];
      const template = patientTemplates[i % patientTemplates.length];
      const doctor = hosp.doctors[i % hosp.doctors.length];
      const symptom = symptomsList[i % symptomsList.length];
      const diagnosis = diagnosesList[i % diagnosesList.length];
      const prescription = prescriptionsList[i % prescriptionsList.length];

      const daysAgo = (30 - i) * 15;
      const visitDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      patientRecords.push({
        name: template.name,
        age: template.age,
        gender: template.gender,
        address: template.address,
        birthCertificateNumber: template.birthCert,
        phone: "+977-9841" + Math.floor(100000 + Math.random() * 900000),
        symptoms: symptom,
        diagnosis: diagnosis,
        prescription: prescription,
        assignedDoctor: doctor,
        hospitalId: hosp._id,
        hospitalName: hosp.hospitalName,
        visitDate: visitDate,
        notes: `Clinical evaluation completed by ${doctor} at ${hosp.hospitalName}.`,
        createdAt: visitDate,
      });
    }

    const seededPatients = await Patient.insertMany(patientRecords);
    console.log(`[SEED SUCCESS] Created ${seededPatients.length} Patient Records across 5 Hospitals!`);

    console.log("[SEED COMPLETE] All 1 Admin, 5 Hospitals, 25 Doctors, and 30 Patient Records seeded successfully into MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("[SEED ERROR]", err);
    process.exit(1);
  }
}

seedDatabase();
