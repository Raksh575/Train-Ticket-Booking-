const express = require("express");
const router = express.Router();
const Train = require("../models/Train");

// GET /api/trains -> list all trains, or search by source/destination/date
router.get("/", async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    const filter = {};

    if (source) filter.source = new RegExp(`^${source}$`, "i");
    if (destination) filter.destination = new RegExp(`^${destination}$`, "i");
    if (date) filter.date = date;

    const trains = await Train.find(filter).sort({ departureTime: 1 });
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trains/:id -> single train details
router.get("/:id", async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trains -> add a new train (admin use)
router.post("/", async (req, res) => {
  try {
    const {
      trainNumber,
      name,
      source,
      destination,
      date,
      departureTime,
      arrivalTime,
      totalSeats,
      fare,
    } = req.body;

    const train = new Train({
      trainNumber,
      name,
      source,
      destination,
      date,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: totalSeats,
      fare,
    });

    const saved = await train.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/trains/:id -> update train details (admin use)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Train not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/trains/:id -> remove a train (admin use)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Train.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Train not found" });
    res.json({ message: "Train deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
