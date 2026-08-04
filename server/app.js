const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Connect Database
connectDB();

// Core Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "LifeTrack Nepal AI Health Intelligence API",
    timestamp: new Date(),
  });
});

// API Routes
app.use("/api", apiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LifeTrack Nepal Backend running on port ${PORT}`);
});
