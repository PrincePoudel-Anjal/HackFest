const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/myHakathon");
    console.log("MongoDB Database Connected Successfully (DB: myHakathon)");

    // Auto-seed Hospitals into database if empty
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      const initialHospitals = [
        {
          name: "Tribhuvan University Teaching Hospital (TUTH)",
          hospitalCode: "TUTH-KTM-01",
          location: { province: "Bagmati Province", district: "Kathmandu", city: "Maharajgunj" },
          phone: "+977-01-4412300",
          email: "info@tuth.edu.np",
        },
        {
          name: "Patan Hospital",
          hospitalCode: "PATAN-LAL-02",
          location: { province: "Bagmati Province", district: "Lalitpur", city: "Lagankhel" },
          phone: "+977-01-5522295",
          email: "admin@patanhospital.org.np",
        },
        {
          name: "Bir Hospital (Central Referral)",
          hospitalCode: "BIR-KTM-03",
          location: { province: "Bagmati Province", district: "Kathmandu", city: "Tundikhel" },
          phone: "+977-01-4221988",
          email: "contact@birhospital.gov.np",
        },
        {
          name: "Grande International Hospital",
          hospitalCode: "GRANDE-KTM-04",
          location: { province: "Bagmati Province", district: "Kathmandu", city: "Dhakasi" },
          phone: "+977-01-5184000",
          email: "info@grandehospital.com",
        },
      ];
      await Hospital.insertMany(initialHospitals);
      console.log("[DATABASE SEED SUCCESS] Pre-seeded 4 initial national hospitals into MongoDB 'hospitals' collection!");
    } else {
      console.log(`[DATABASE OK] Found ${hospitalCount} hospitals in MongoDB 'hospitals' collection.`);
    }
  } catch (err) {
    console.error("Error connecting to MongoDB database:", err);
  }
};

module.exports = connectDB;