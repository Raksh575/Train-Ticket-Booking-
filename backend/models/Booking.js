const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
    default: 1,
  },
  totalFare: {
    type: Number,
    required: true,
  },
  pnr: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["CONFIRMED", "CANCELLED"],
    default: "CONFIRMED",
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
