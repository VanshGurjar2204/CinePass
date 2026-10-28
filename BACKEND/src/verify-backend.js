import mongoose from "mongoose";
import dns from "dns";
import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

async function runTests() {
  console.log("=== STARTING BACKEND AUTOMATED VERIFICATION ===");
  await mongoose.connect(ENV.MONGO_URI);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  console.log("Test server listening on port 5001");

  const baseUrl = "http://127.0.0.1:5001/api";

  const request = async (endpoint, method = "GET", body = null, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${endpoint}`, opts);
    const data = await res.json();
    return { status: res.status, data };
  };

  let userToken = null;
  let adminToken = null;
  let sampleShowId = null;
  let sampleSeatIds = [];
  let sampleMovieId = null;

  // 1. Health check
  const health = await request("/health");
  console.log("1. Health check:", health.status === 200 ? "PASS" : "FAIL");

  // 2. Login as admin
  const adminLogin = await request("/auth/login", "POST", {
    email: "admin@cinepass.com",
    password: "Password@123",
  });
  console.log("2. Admin login:", adminLogin.status === 200 && adminLogin.data.data.user.role === "admin" ? "PASS" : "FAIL");
  adminToken = adminLogin.data?.data?.accessToken;

  // 3. Login as customer
  const userLogin = await request("/auth/login", "POST", {
    email: "john@example.com",
    password: "Password@123",
  });
  console.log("3. User login:", userLogin.status === 200 ? "PASS" : "FAIL");
  userToken = userLogin.data?.data?.accessToken;

  // 4. Test duplicate email rejection
  const dupReg = await request("/auth/register", "POST", {
    name: "John Dup",
    email: "john@example.com",
    phone: "+123456789",
    password: "Password@123",
    confirmPassword: "Password@123",
  });
  console.log("4. Duplicate email rejection:", dupReg.status === 409 ? "PASS" : "FAIL");

  // 5. Test auth get me
  const me = await request("/auth/me", "GET", null, userToken);
  console.log("5. Auth /me:", me.status === 200 && me.data.data.user.email === "john@example.com" ? "PASS" : "FAIL");

  // 6. Test Movies list & search
  const moviesRes = await request("/movies?search=Interstellar");
  console.log("6. Movies search:", moviesRes.status === 200 && moviesRes.data.data.movies.length > 0 ? "PASS" : "FAIL");
  sampleMovieId = moviesRes.data.data.movies[0]._id;

  // 7. Test Movie shows
  const showsRes = await request(`/movies/${sampleMovieId}/shows`);
  console.log("7. Movie shows fetched:", showsRes.status === 200 && showsRes.data.data.length > 0 ? "PASS" : "FAIL");
  sampleShowId = showsRes.data.data[0]._id;

  // 8. Test Seat Map
  const seatsRes = await request(`/shows/${sampleShowId}/seats`, "GET", null, userToken);
  console.log("8. Seat map fetched:", seatsRes.status === 200 && seatsRes.data.data.seats.length > 0 ? "PASS" : "FAIL");
  const availableSeats = seatsRes.data.data.seats.filter((s) => s.status === "available");
  sampleSeatIds = [availableSeats[0]._id, availableSeats[1]._id];

  // 9. Test Lock Seats
  const lockRes = await request("/bookings/lock-seats", "POST", {
    showId: sampleShowId,
    seatIds: sampleSeatIds,
  }, userToken);
  if (lockRes.status !== 200) console.log("LOCK ERROR:", lockRes.data);
  console.log("9. Seat locking:", lockRes.status === 200 && lockRes.data.data.locked === true ? "PASS" : "FAIL");

  // 10. Test Double Booking / Concurrent Lock Prevention by Sarah
  const sarahLogin = await request("/auth/login", "POST", {
    email: "sarah@example.com",
    password: "Password@123",
  });
  const sarahToken = sarahLogin.data?.data?.accessToken;
  const conflictLock = await request("/bookings/lock-seats", "POST", {
    showId: sampleShowId,
    seatIds: [sampleSeatIds[0]], // trying to lock John's locked seat
  }, sarahToken);
  console.log("10. Conflict Lock Prevention:", conflictLock.status === 400 ? "PASS" : "FAIL");

  // 11. Create Pending Booking
  const bookingRes = await request("/bookings", "POST", {
    showId: sampleShowId,
    seatIds: sampleSeatIds,
  }, userToken);
  console.log("11. Pending booking created:", bookingRes.status === 201 ? "PASS" : "FAIL");
  const newBookingId = bookingRes.data.data.bookingId;

  // 12. Confirm Booking (Payment Verification)
  const verifyRes = await request("/payments/verify", "POST", {
    bookingId: newBookingId,
    sessionId: "cs_simulated_test",
  }, userToken);
  console.log("12. Payment verified & confirmed:", verifyRes.status === 200 && verifyRes.data.data.bookingStatus === "confirmed" ? "PASS" : "FAIL");

  // 13. Verify Seats are now Booked and cannot be booked again
  const reSeatMap = await request(`/shows/${sampleShowId}/seats`);
  const reCheckedSeat = reSeatMap.data.data.seats.find((s) => s._id === sampleSeatIds[0]);
  console.log("13. Permanent seat booked state:", reCheckedSeat.status === "booked" ? "PASS" : "FAIL");

  // 14. Watchlist Test
  const addWatch = await request(`/watchlist/${sampleMovieId}`, "POST", null, userToken);
  const checkWatch = await request(`/watchlist/check/${sampleMovieId}`, "GET", null, userToken);
  console.log("14. Watchlist add & check:", checkWatch.status === 200 && checkWatch.data.data.inWatchlist ? "PASS" : "FAIL");

  // 15. Reviews Test
  const addRev = await request(`/movies/${sampleMovieId}/reviews`, "POST", {
    rating: 5,
    review: "Incredible cinematic journey!",
  }, userToken);
  console.log("15. Submit review:", addRev.status === 201 ? "PASS" : "FAIL");

  // 16. In-App Notifications
  const notifRes = await request("/notifications", "GET", null, userToken);
  console.log("16. Notifications fetched:", notifRes.status === 200 && notifRes.data.data.notifications.length > 0 ? "PASS" : "FAIL");

  // 17. Admin Dashboard Stats
  const adminStats = await request("/admin/stats", "GET", null, adminToken);
  console.log("17. Admin stats access:", adminStats.status === 200 && adminStats.data.data.stats.totalUsers > 0 ? "PASS" : "FAIL");

  // 18. Regular user accessing admin route (Must be 403 Forbidden)
  const forbiddenCheck = await request("/admin/stats", "GET", null, userToken);
  console.log("18. Role security (user blocked from admin API):", forbiddenCheck.status === 403 ? "PASS" : "FAIL");

  // 19. Admin Show Overlap Prevention
  const showConflict = await request("/admin/shows", "POST", {
    movie: sampleMovieId,
    theater: showsRes.data.data[0].theater._id,
    screen: showsRes.data.data[0].screen._id,
    showDate: showsRes.data.data[0].showDate,
    startTime: showsRes.data.data[0].startTime,
    endTime: showsRes.data.data[0].endTime,
    ticketPrice: 15.0,
  }, adminToken);
  console.log("19. Admin show scheduling conflict prevention:", showConflict.status === 409 ? "PASS" : "FAIL");

  console.log("=== ALL 19 BACKEND TESTS COMPLETED ===");
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
