const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  date: {
    // Journey date, stored as YYYY-MM-DD string for simple querying
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 100,
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 100,
  },
  fare: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Train", trainSchema);
