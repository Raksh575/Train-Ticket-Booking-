require("dotenv").config();
const mongoose = require("mongoose");
const Train = require("./models/Train");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/train_booking";

const sampleTrains = [
  {
    trainNumber: "12621",
    name: "Tamil Nadu Express",
    source: "Chennai",
    destination: "Delhi",
    date: "2026-09-20",
    departureTime: "22:00",
    arrivalTime: "06:30",
    totalSeats: 120,
    availableSeats: 120,
    fare: 1450,
  },
  {
    trainNumber: "12639",
    name: "Brindavan Express",
    source: "Chennai",
    destination: "Bangalore",
    date: "2026-09-20",
    departureTime: "07:50",
    arrivalTime: "13:10",
    totalSeats: 90,
    availableSeats: 90,
    fare: 320,
  },
  {
    trainNumber: "16609",
    name: "Kanyakumari Express",
    source: "Coimbatore",
    destination: "Kanyakumari",
    date: "2026-09-20",
    departureTime: "23:15",
    arrivalTime: "05:40",
    totalSeats: 100,
    availableSeats: 100,
    fare: 380,
  },
  {
    trainNumber: "12678",
    name: "Kovai Express",
    source: "Coimbatore",
    destination: "Chennai",
    date: "2026-09-21",
    departureTime: "06:00",
    arrivalTime: "13:20",
    totalSeats: 110,
    availableSeats: 110,
    fare: 410,
  },
  {
    trainNumber: "12007",
    name: "Shatabdi Express",
    source: "Bangalore",
    destination: "Chennai",
    date: "2026-09-21",
    departureTime: "06:00",
    arrivalTime: "11:00",
    totalSeats: 80,
    availableSeats: 80,
    fare: 750,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB, seeding data...");

    await Train.deleteMany({});
    await Train.insertMany(sampleTrains);

    console.log(`Inserted ${sampleTrains.length} trains.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
}

seed();
