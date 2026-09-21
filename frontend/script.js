const API_BASE = "/api";

// ---------- Tab Navigation ----------
const navBtns = document.querySelectorAll(".nav-btn");
navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active-tab"));
    document.getElementById(btn.dataset.tab).classList.add("active-tab");
  });
});

// ---------- Toast ----------
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden", "error");
  if (isError) toast.classList.add("error");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ---------- Search Trains ----------
const searchForm = document.getElementById("searchForm");
const resultsContainer = document.getElementById("resultsContainer");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const source = document.getElementById("source").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const date = document.getElementById("journeyDate").value;

  resultsContainer.innerHTML = `<div class="empty-state">Searching...</div>`;

  try {
    const params = new URLSearchParams({ source, destination, date });
    const res = await fetch(`${API_BASE}/trains?${params.toString()}`);
    const trains = await res.json();

    if (!res.ok) throw new Error(trains.message || "Search failed");

    renderTrainResults(trains);
  } catch (err) {
    resultsContainer.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
});

function renderTrainResults(trains) {
  if (!trains.length) {
    resultsContainer.innerHTML = `<div class="empty-state">No trains found for this route/date.</div>`;
    return;
  }

  resultsContainer.innerHTML = trains
    .map((t) => {
      const lowSeats = t.availableSeats > 0 && t.availableSeats <= 10;
      const soldOut = t.availableSeats <= 0;
      return `
      <div class="train-card">
        <div class="train-main">
          <h3>${t.name} <span style="color:#9aa1ae;font-weight:400;">(${t.trainNumber})</span></h3>
          <div class="train-route">${t.source} → ${t.destination} · ${t.date}</div>
          <div class="train-times">
            <span>Dep <strong>${t.departureTime}</strong></span>
            <span>Arr <strong>${t.arrivalTime}</strong></span>
          </div>
        </div>
        <div class="train-side">
          <div class="fare">₹${t.fare}</div>
          <div class="seats-left ${lowSeats ? "low" : ""}">
            ${soldOut ? "Sold out" : `${t.availableSeats} seats left`}
          </div>
          <button class="btn primary" ${soldOut ? "disabled" : ""} onclick='openBookingModal(${JSON.stringify(t)})'>
            ${soldOut ? "Unavailable" : "Book Now"}
          </button>
        </div>
      </div>
      `;
    })
    .join("");
}

// ---------- Booking Modal ----------
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
let selectedTrain = null;

function openBookingModal(train) {
  selectedTrain = train;
  document.getElementById("modalTrainId").value = train._id;
  document.getElementById("modalTrainInfo").textContent =
    `${train.name} (${train.trainNumber}) · ${train.source} → ${train.destination} · ${train.date}`;
  document.getElementById("seatsBooked").value = 1;
  updateFareSummary();
  bookingModal.classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", () => {
  bookingModal.classList.add("hidden");
});

document.getElementById("seatsBooked").addEventListener("input", updateFareSummary);

function updateFareSummary() {
  if (!selectedTrain) return;
  const seats = Number(document.getElementById("seatsBooked").value) || 1;
  const total = seats * selectedTrain.fare;
  document.getElementById("fareSummary").innerHTML =
    `<span>Total (${seats} seat${seats > 1 ? "s" : ""})</span><span>₹${total}</span>`;
}

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    trainId: document.getElementById("modalTrainId").value,
    passengerName: document.getElementById("passengerName").value.trim(),
    email: document.getElementById("passengerEmail").value.trim(),
    age: Number(document.getElementById("passengerAge").value),
    gender: document.getElementById("passengerGender").value,
    seatsBooked: Number(document.getElementById("seatsBooked").value),
  };

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Booking failed");

    bookingModal.classList.add("hidden");
    bookingForm.reset();
    showConfirmation(data);
    searchForm.dispatchEvent(new Event("submit")); // refresh seat counts
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- Confirmation Modal ----------
const confirmModal = document.getElementById("confirmModal");

function showConfirmation(booking) {
  document.getElementById("confirmDetails").innerHTML = `
    <div><strong>PNR:</strong> ${booking.pnr}</div>
    <div><strong>Train:</strong> ${booking.train.name} (${booking.train.trainNumber})</div>
    <div><strong>Route:</strong> ${booking.train.source} → ${booking.train.destination}</div>
    <div><strong>Date:</strong> ${booking.train.date}</div>
    <div><strong>Passenger:</strong> ${booking.passengerName}</div>
    <div><strong>Seats:</strong> ${booking.seatsBooked}</div>
    <div><strong>Total Fare:</strong> ₹${booking.totalFare}</div>
  `;
  confirmModal.classList.remove("hidden");
}

document.getElementById("closeConfirmModal").addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});
document.getElementById("confirmOkBtn").addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

// ---------- My Bookings ----------
const lookupForm = document.getElementById("lookupForm");
const bookingsContainer = document.getElementById("bookingsContainer");

lookupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("lookupEmail").value.trim();

  bookingsContainer.innerHTML = `<div class="empty-state">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(email)}`);
    const bookings = await res.json();

    if (!res.ok) throw new Error(bookings.message || "Failed to fetch bookings");

    renderBookings(bookings);
  } catch (err) {
    bookingsContainer.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
});

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsContainer.innerHTML = `<div class="empty-state">No bookings found for this email.</div>`;
    return;
  }

  bookingsContainer.innerHTML = bookings
    .map((b) => {
      const t = b.train || {};
      return `
      <div class="booking-card">
        <div class="booking-top">
          <div>
            <strong>${t.name || "N/A"}</strong> (${t.trainNumber || "-"})
            <div class="booking-pnr">PNR: ${b.pnr}</div>
          </div>
          <span class="status ${b.status}">${b.status}</span>
        </div>
        <div>${t.source || "?"} → ${t.destination || "?"} · ${t.date || ""}</div>
        <div>Passenger: ${b.passengerName} · Seats: ${b.seatsBooked} · ₹${b.totalFare}</div>
        ${
          b.status === "CONFIRMED"
            ? `<button class="cancel-btn" onclick="cancelBooking('${b._id}')">Cancel Booking</button>`
            : ""
        }
      </div>
      `;
    })
    .join("");
}

async function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  try {
    const res = await fetch(`${API_BASE}/bookings/cancel/${bookingId}`, {
      method: "PUT",
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Cancellation failed");

    showToast("Booking cancelled successfully");
    lookupForm.dispatchEvent(new Event("submit"));
  } catch (err) {
    showToast(err.message, true);
  }
}

// Set default date field to today
document.getElementById("journeyDate").valueAsDate = new Date();
