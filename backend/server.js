require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const trainRoutes = require("./routes/trains");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/train_booking";

app.use(cors());
app.use(express.json());

// Serve the plain HTML/CSS/JS frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

// API routes
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
