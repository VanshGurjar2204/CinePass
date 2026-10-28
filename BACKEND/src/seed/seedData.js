import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";
import Screen from "../models/Screen.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Watchlist from "../models/Watchlist.js";
import Notification from "../models/Notification.js";
import SeatLock from "../models/SeatLock.js";
import { ENV } from "../config/env.js";

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${ENV.MONGO_URI}...`);
    await mongoose.connect(ENV.MONGO_URI);
    console.log("[Seed] Connected! Clearing old collections...");

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theater.deleteMany({}),
      Screen.deleteMany({}),
      Seat.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Watchlist.deleteMany({}),
      Notification.deleteMany({}),
      SeatLock.deleteMany({}),
    ]);

    console.log("[Seed] Cleared database. Creating Users...");

    // 1. Create Admin and Regular Users
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@cinepass.com",
      phone: "+1234567890",
      password: "Password@123",
      role: "admin",
    });

    const user1 = await User.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1987654321",
      password: "Password@123",
      role: "user",
    });

    const user2 = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+1555444333",
      password: "Password@123",
      role: "user",
    });

    console.log("[Seed] Users created: admin@cinepass.com, john@example.com, sarah@example.com");

    // 2. Create Movies
    const moviesData = [
      {
        title: "Interstellar: Beyond Time",
        slug: "interstellar-beyond-time",
        description:
          "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        genre: ["Sci-Fi", "Adventure", "Drama"],
        language: "English",
        duration: 169,
        rating: 4.9,
        totalRatings: 18,
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
        director: "Christopher Nolan",
        releaseDate: new Date("2026-01-15"),
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        certificate: "PG-13",
        status: "now_showing",
        featured: true,
      },
      {
        title: "Cyberpunk: Neon Shadows",
        slug: "cyberpunk-neon-shadows",
        description:
          "In a sprawling dystopian megacity bathed in neon, a rogue cyber-detective uncovers an AI conspiracy that threatens the fragile boundary between synthetic minds and human souls.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        language: "English",
        duration: 142,
        rating: 4.7,
        totalRatings: 12,
        cast: ["Keanu Reeves", "Ana de Armas", "Karl Urban", "Hiroyuki Sanada"],
        director: "Denis Villeneuve",
        releaseDate: new Date("2026-02-01"),
        poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=LembwKDo1Dc",
        certificate: "R",
        status: "now_showing",
        featured: true,
      },
      {
        title: "The Silent Summit",
        slug: "the-silent-summit",
        description:
          "An elite mountaineer attempts an uncharted winter ascent of K2 without supplemental oxygen, confronting the unforgiving elements and the trauma that drove him to the edge.",
        genre: ["Drama", "Adventure"],
        language: "English",
        duration: 128,
        rating: 4.5,
        totalRatings: 8,
        cast: ["Jake Gyllenhaal", "Josh Brolin", "Florence Pugh"],
        director: "Baltasar Kormákur",
        releaseDate: new Date("2026-02-14"),
        poster: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=5zconZkkBB8",
        certificate: "PG-13",
        status: "now_showing",
        featured: false,
      },
      {
        title: "Echoes of the Renaissance",
        slug: "echoes-of-the-renaissance",
        description:
          "A captivating historical mystery exploring the hidden lives, forbidden romances, and secret notebooks of Florence's greatest master artisans during the 15th century.",
        genre: ["Drama", "History", "Romance"],
        language: "English",
        duration: 135,
        rating: 4.6,
        totalRatings: 9,
        cast: ["Timothée Chalamet", "Saoirse Ronan", "Mark Rylance"],
        director: "Luca Guadagnino",
        releaseDate: new Date("2026-03-01"),
        poster: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=vM-Bja2Gy04",
        certificate: "PG-13",
        status: "now_showing",
        featured: false,
      },
      {
        title: "Solaris Odyssey: Origins",
        slug: "solaris-odyssey-origins",
        description:
          "The highly anticipated prequel charting humanity's maiden quantum jump into the Proxima Centauri cluster and the mysterious sentient energy entity waiting for them.",
        genre: ["Sci-Fi", "Mystery", "Action"],
        language: "English",
        duration: 155,
        rating: 0,
        totalRatings: 0,
        cast: ["Oscar Isaac", "Zendaya", "David Oyelowo"],
        director: "Ridley Scott",
        releaseDate: new Date("2026-11-20"),
        poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        certificate: "PG-13",
        status: "upcoming",
        featured: false,
      },
      {
        title: "The Velocity Protocol",
        slug: "the-velocity-protocol",
        description:
          "A high-stakes international heist thriller featuring an undercover formula racer recruited to infiltrate a syndicated syndicate using prototype hypercars.",
        genre: ["Action", "Thriller"],
        language: "English",
        duration: 118,
        rating: 0,
        totalRatings: 0,
        cast: ["Michael B. Jordan", "Tom Hardy", "Charlize Theron"],
        director: "Justin Lin",
        releaseDate: new Date("2026-12-05"),
        poster: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
        backdrop: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=hA6hldpST08",
        certificate: "PG-13",
        status: "upcoming",
        featured: false,
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Created ${createdMovies.length} movies.`);

    // 3. Create Theaters
    const theatersData = [
      {
        name: "CinePass Grand Metro",
        location: "Downtown Plaza, 5th Avenue",
        address: "742 Evergreen Terrace, Downtown",
        city: "New York",
        facilities: ["IMAX Laser", "Dolby Atmos", "Recliner Seats", "Gourmet Dine-In", "Valet Parking"],
        status: "active",
      },
      {
        name: "Starlight CinePlex West",
        location: "Westfield Promenade",
        address: "1020 Ocean Boulevard, Westside",
        city: "Los Angeles",
        facilities: ["4DX Motion", "RealD 3D", "Full Bar & Lounge", "Wheelchair Accessible"],
        status: "active",
      },
      {
        name: "Apex Century Theaters",
        location: "Financial District Galleria",
        address: "400 Market Street",
        city: "San Francisco",
        facilities: ["Dolby Vision", "Ultra-HD Projection", "Artisan Concessions"],
        status: "active",
      },
    ];

    const createdTheaters = await Theater.insertMany(theatersData);
    console.log(`[Seed] Created ${createdTheaters.length} theaters.`);

    // 4. Create Screens and Seats for each theater
    const createdScreens = [];
    for (const theater of createdTheaters) {
      // Screen 1: IMAX
      const screen1 = await Screen.create({
        name: "Screen 1 (IMAX Laser)",
        theater: theater._id,
        screenType: "IMAX",
        totalSeats: 36,
        status: "active",
      });
      createdScreens.push(screen1);

      // Screen 2: Dolby Atmos Standard
      const screen2 = await Screen.create({
        name: "Screen 2 (Dolby Atmos)",
        theater: theater._id,
        screenType: "Standard",
        totalSeats: 30,
        status: "active",
      });
      createdScreens.push(screen2);

      // Generate seats for Screen 1 (4 rows: A & B regular, C premium, D recliner)
      const seatsScreen1 = [];
      ["A", "B"].forEach((row) => {
        for (let num = 1; num <= 10; num++) {
          seatsScreen1.push({
            screen: screen1._id,
            theater: theater._id,
            row,
            seatNumber: num,
            seatLabel: `${row}${num}`,
            seatType: "regular",
            priceMultiplier: 1.0,
            status: "active",
          });
        }
      });
      for (let num = 1; num <= 10; num++) {
        seatsScreen1.push({
          screen: screen1._id,
          theater: theater._id,
          row: "C",
          seatNumber: num,
          seatLabel: `C${num}`,
          seatType: "premium",
          priceMultiplier: 1.3,
          status: "active",
        });
      }
      for (let num = 1; num <= 6; num++) {
        seatsScreen1.push({
          screen: screen1._id,
          theater: theater._id,
          row: "D",
          seatNumber: num,
          seatLabel: `D${num}`,
          seatType: "recliner",
          priceMultiplier: 1.6,
          status: "active",
        });
      }
      await Seat.insertMany(seatsScreen1);

      // Generate seats for Screen 2 (3 rows: A regular, B regular, C premium)
      const seatsScreen2 = [];
      ["A", "B"].forEach((row) => {
        for (let num = 1; num <= 10; num++) {
          seatsScreen2.push({
            screen: screen2._id,
            theater: theater._id,
            row,
            seatNumber: num,
            seatLabel: `${row}${num}`,
            seatType: "regular",
            priceMultiplier: 1.0,
            status: "active",
          });
        }
      });
      for (let num = 1; num <= 10; num++) {
        seatsScreen2.push({
          screen: screen2._id,
          theater: theater._id,
          row: "C",
          seatNumber: num,
          seatLabel: `C${num}`,
          seatType: "premium",
          priceMultiplier: 1.3,
          status: "active",
        });
      }
      await Seat.insertMany(seatsScreen2);
    }

    console.log(`[Seed] Created ${createdScreens.length} screens and full seat layouts.`);

    // 5. Create Shows across today and upcoming days
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const showSlots = [
      { start: "11:00", end: "13:45", price: 14.5 },
      { start: "14:30", end: "17:15", price: 16.0 },
      { start: "18:00", end: "20:45", price: 18.5 },
      { start: "21:30", end: "00:15", price: 17.0 },
    ];

    const nowShowingMovies = createdMovies.filter((m) => m.status === "now_showing");
    const createdShows = [];

    for (const date of dates) {
      for (let sIdx = 0; sIdx < createdScreens.length; sIdx++) {
        const screen = createdScreens[sIdx];
        const movie = nowShowingMovies[sIdx % nowShowingMovies.length];
        const slot = showSlots[sIdx % showSlots.length];

        const show = await Show.create({
          movie: movie._id,
          theater: screen.theater,
          screen: screen._id,
          showDate: date,
          startTime: slot.start,
          endTime: slot.end,
          ticketPrice: slot.price,
          status: "scheduled",
        });
        createdShows.push(show);
      }
    }

    console.log(`[Seed] Created ${createdShows.length} scheduled shows.`);

    // 6. Create Sample Reviews
    await Review.create([
      {
        movie: createdMovies[0]._id,
        user: user1._id,
        rating: 5,
        review: "An absolute visual and philosophical masterpiece. Christopher Nolan delivers an unforgettable experience!",
      },
      {
        movie: createdMovies[0]._id,
        user: user2._id,
        rating: 5,
        review: "The organ score and emotional climax left the entire theater in awe. Must watch on an IMAX screen!",
      },
      {
        movie: createdMovies[1]._id,
        user: user1._id,
        rating: 5,
        review: "Mind-blowing cyberpunk world-building with intense practical effects and synth soundtrack.",
      },
      {
        movie: createdMovies[2]._id,
        user: user2._id,
        rating: 4,
        review: "Breathtaking cinematography and gripping sound design that puts you right on the icy mountain ridge.",
      },
    ]);

    // 7. Create Sample Watchlist entries
    await Watchlist.create([
      { user: user1._id, movie: createdMovies[4]._id },
      { user: user1._id, movie: createdMovies[1]._id },
      { user: user2._id, movie: createdMovies[0]._id },
    ]);

    // 8. Create a Confirmed Sample Booking for John Doe
    const firstShow = createdShows[0];
    const screen1Seats = await Seat.find({ screen: firstShow.screen }).limit(2);
    const bookingId = "CP-SEED-2026-X9Y2";

    const sampleBooking = await Booking.create({
      bookingId,
      user: user1._id,
      movie: firstShow.movie,
      theater: firstShow.theater,
      screen: firstShow.screen,
      show: firstShow._id,
      seats: screen1Seats.map((s) => ({
        seat: s._id,
        seatLabel: s.seatLabel,
        seatType: s.seatType,
        price: firstShow.ticketPrice * s.priceMultiplier,
      })),
      ticketCount: screen1Seats.length,
      subtotal: firstShow.ticketPrice * 2,
      convenienceFee: 2.5,
      taxAmount: 1.45,
      totalAmount: firstShow.ticketPrice * 2 + 2.5 + 1.45,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: "pi_seed_sample_intent_confirmed",
      paymentMethod: "card",
      bookingDate: new Date(),
      qrCodeData: `CINEPASS|${bookingId}|${user1._id}|CONFIRMED`,
    });

    // 9. Create Sample In-App Notifications
    await Notification.create([
      {
        user: user1._id,
        title: "Booking Confirmed: Interstellar",
        message: `Your booking ${bookingId} for Interstellar: Beyond Time is confirmed! Show this in your app at the theater entrance.`,
        type: "booking_confirmation",
        data: { bookingId },
        isRead: false,
      },
      {
        user: user1._id,
        title: "Payment Receipt",
        message: `Your payment of $${sampleBooking.totalAmount.toFixed(2)} was successfully processed.`,
        type: "payment_receipt",
        data: { bookingId },
        isRead: true,
      },
    ]);

    console.log("[Seed] Sample booking & notifications created!");
    console.log("==========================================");
    console.log("Database seeded successfully!");
    console.log("Admin Credentials:  admin@cinepass.com / Password@123");
    console.log("Customer User:      john@example.com   / Password@123");
    console.log("Customer User 2:    sarah@example.com  / Password@123");
    console.log("==========================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Fatal Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

