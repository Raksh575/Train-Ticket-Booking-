const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

function generatePNR() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PNR${timestamp}${random}`;
}

// POST /api/bookings -> book seats on a train
router.post("/", async (req, res) => {
  try {
    const { trainId, passengerName, email, age, gender, seatsBooked } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return res.status(400).json({ message: "Invalid train id" });
    }

    const seats = Number(seatsBooked) || 1;

    // Atomically decrement availableSeats only if enough seats remain,
    // to avoid double-booking under concurrent requests.
    const train = await Train.findOneAndUpdate(
      { _id: trainId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true }
    );

    if (!train) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const booking = new Booking({
      train: train._id,
      passengerName,
      email,
      age,
      gender,
      seatsBooked: seats,
      totalFare: train.fare * seats,
      pnr: generatePNR(),
      status: "CONFIRMED",
    });

    const saved = await booking.save();
    const populated = await saved.populate("train");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/bookings/:email -> all bookings for a passenger email
router.get("/:email", async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.params.email })
      .populate("train")
      .sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/pnr/:pnr -> lookup a single booking by PNR
router.get("/pnr/:pnr", async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr }).populate("train");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/cancel/:id -> cancel a booking and release seats
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    await Train.findByIdAndUpdate(booking.train, {
      $inc: { availableSeats: booking.seatsBooked },
    });

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
