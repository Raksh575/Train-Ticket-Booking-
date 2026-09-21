# RailBook — Train Ticket Booking System (Full Stack)

A basic full-stack train ticket booking project:
- **Frontend:** Plain HTML, CSS, JavaScript (no framework)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

## Features
- Search trains by source, destination, and date
- Book seats on a train (with atomic seat-availability check to prevent overbooking)
- Auto-generated PNR for every booking
- View bookings by email
- Cancel a booking (releases seats back to the train)

## Project Structure
```
train-ticket-booking/
├── backend/
│   ├── models/
│   │   ├── Train.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── trains.js
│   │   └── bookings.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and adjust if needed:
```bash
cp .env.example .env
```
Default values:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/train_booking
```

### 4. Seed sample train data
```bash
npm run seed
```
This inserts a handful of sample trains (Chennai, Coimbatore, Bangalore, Delhi routes) dated around 2026-09-20/21 — edit `seed.js` to add your own routes/dates.

### 5. Run the server
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 6. Open the app
Visit **http://localhost:5000** in your browser. The Express server serves the `frontend/` folder directly, so no separate frontend server is needed.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trains?source=&destination=&date=` | Search trains |
| GET | `/api/trains/:id` | Get single train |
| POST | `/api/trains` | Add a train (admin) |
| PUT | `/api/trains/:id` | Update a train (admin) |
| DELETE | `/api/trains/:id` | Delete a train (admin) |
| POST | `/api/bookings` | Book seats |
| GET | `/api/bookings/:email` | Get bookings by email |
| GET | `/api/bookings/pnr/:pnr` | Get booking by PNR |
| PUT | `/api/bookings/cancel/:id` | Cancel a booking |

### Example: Book a ticket
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "trainId": "<train_id_from_search>",
    "passengerName": "Rakshit Kumar",
    "email": "rakshit@example.com",
    "age": 22,
    "gender": "Male",
    "seatsBooked": 2
  }'
```

## Notes / Possible Extensions
- No authentication is included (basic scope) — bookings are looked up by email only.
- Seat allocation is by count only (no seat-number/coach selection).
- To add login, an admin dashboard, or payment simulation later, the schema and routes here are structured so those can be layered on without a rewrite.
