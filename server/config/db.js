const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const res = await mongoose.connect("mongodb://localhost:27017/myHakathon");
    console.log("Connection with database succesfull");
  } catch (err) {
    console.log("Error in databse:", err);
  }
};
module.exports=connectDB;