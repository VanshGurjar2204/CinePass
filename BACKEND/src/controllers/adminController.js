import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";
import Screen from "../models/Screen.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper: generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

// Helper: check time overlap between two "HH:MM" intervals
const timesOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

// --- 1. OVERVIEW & STATS ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const [
      totalUsers,
      totalMovies,
      totalTheaters,
      totalBookings,
      confirmedBookings,
      upcomingShows,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Movie.countDocuments(),
      Theater.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ bookingStatus: "confirmed" }).select("totalAmount"),
      Show.countDocuments({ showDate: { $gte: todayStr }, status: "scheduled" }),
      Booking.find()
        .populate("user", "name email")
        .populate("movie", "title")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    return sendSuccess(res, 200, "Dashboard stats fetched", {
      stats: {
        totalUsers,
        totalMovies,
        totalTheaters,
        totalBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        upcomingShows,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// --- 2. MOVIE MANAGEMENT ---
export const createMovie = async (req, res, next) => {
  try {
    const data = req.body;
    let slug = slugify(data.title);

    // Ensure unique slug
    const existing = await Movie.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const movie = await Movie.create({ ...data, slug });
    return sendSuccess(res, 201, "Movie created successfully", movie);
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.title) {
      data.slug = slugify(data.title);
    }

    const movie = await Movie.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
    if (!movie) {
      return sendError(res, 404, "Movie not found");
    }

    return sendSuccess(res, 200, "Movie updated successfully", movie);
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return sendError(res, 404, "Movie not found");
    }
    // Also remove associated shows
    await Show.deleteMany({ movie: id });
    return sendSuccess(res, 200, "Movie and related shows deleted successfully");
  } catch (error) {
    next(error);
  }
};

// --- 3. THEATER MANAGEMENT ---
export const createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    return sendSuccess(res, 201, "Theater created successfully", theater);
  } catch (error) {
    next(error);
  }
};

export const updateTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findByIdAndUpdate(id, req.body, { returnDocument: "after", runValidators: true });
    if (!theater) {
      return sendError(res, 404, "Theater not found");
    }
    return sendSuccess(res, 200, "Theater updated successfully", theater);
  } catch (error) {
    next(error);
  }
};

export const deleteTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findByIdAndDelete(id);
    if (!theater) {
      return sendError(res, 404, "Theater not found");
    }
    // Delete associated screens, seats, shows
    const screens = await Screen.find({ theater: id });
    const screenIds = screens.map((s) => s._id);
    await Screen.deleteMany({ theater: id });
    await Seat.deleteMany({ theater: id });
    await Show.deleteMany({ theater: id });

    return sendSuccess(res, 200, "Theater and related entities deleted successfully");
  } catch (error) {
    next(error);
  }
};

// --- 4. SCREEN MANAGEMENT ---
export const createScreen = async (req, res, next) => {
  try {
    const screen = await Screen.create(req.body);
    return sendSuccess(res, 201, "Screen created successfully", screen);
  } catch (error) {
    next(error);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    if (!screen) {
      return sendError(res, 404, "Screen not found");
    }
    return sendSuccess(res, 200, "Screen updated successfully", screen);
  } catch (error) {
    next(error);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findByIdAndDelete(id);
    if (!screen) {
      return sendError(res, 404, "Screen not found");
    }
    await Seat.deleteMany({ screen: id });
    await Show.deleteMany({ screen: id });
    return sendSuccess(res, 200, "Screen and seats deleted successfully");
  } catch (error) {
    next(error);
  }
};

// --- 5. SEAT MANAGEMENT & LAYOUT GENERATOR ---
export const generateSeatLayout = async (req, res, next) => {
  try {
    const { screenId, rowsConfig } = req.body;
    // rowsConfig example:
    // [
    //   { row: 'A', seatsCount: 10, seatType: 'regular', priceMultiplier: 1.0 },
    //   { row: 'B', seatsCount: 10, seatType: 'regular', priceMultiplier: 1.0 },
    //   { row: 'C', seatsCount: 10, seatType: 'premium', priceMultiplier: 1.3 },
    //   { row: 'D', seatsCount: 8, seatType: 'recliner', priceMultiplier: 1.6 }
    // ]

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return sendError(res, 404, "Screen not found");
    }

    // Clear existing seats for this screen
    await Seat.deleteMany({ screen: screenId });

    const newSeats = [];
    rowsConfig.forEach((cfg) => {
      const rowName = cfg.row.toUpperCase();
      const count = Number(cfg.seatsCount);
      const type = cfg.seatType || "regular";
      const multiplier = Number(cfg.priceMultiplier) || (type === "recliner" ? 1.6 : type === "premium" ? 1.3 : 1.0);

      for (let i = 1; i <= count; i++) {
        newSeats.push({
          screen: screenId,
          theater: screen.theater,
          row: rowName,
          seatNumber: i,
          seatLabel: `${rowName}${i}`,
          seatType: type,
          priceMultiplier: multiplier,
          status: "active",
        });
      }
    });

    const createdSeats = await Seat.insertMany(newSeats);
    screen.totalSeats = createdSeats.length;
    await screen.save();

    return sendSuccess(res, 201, `Generated ${createdSeats.length} seats for ${screen.name}`, createdSeats);
  } catch (error) {
    next(error);
  }
};

export const updateSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    if (!seat) {
      return sendError(res, 404, "Seat not found");
    }
    return sendSuccess(res, 200, "Seat updated", seat);
  } catch (error) {
    next(error);
  }
};

// --- 6. SHOW MANAGEMENT (WITH OVERLAP DETECTION) ---
export const createShow = async (req, res, next) => {
  try {
    const { movie, theater, screen, showDate, startTime, endTime, ticketPrice } = req.body;

    // Validate that endTime > startTime
    if (startTime >= endTime) {
      return sendError(res, 400, "End time must be after start time");
    }

    // Overlap Detection:
    // Check if any existing active show on this exact screen and date overlaps with [startTime, endTime]
    const existingShows = await Show.find({
      screen,
      showDate,
      status: { $ne: "cancelled" },
    });

    const hasConflict = existingShows.some((existing) => {
      return timesOverlap(startTime, endTime, existing.startTime, existing.endTime);
    });

    if (hasConflict) {
      return sendError(
        res,
        409,
        "Scheduling Conflict: Another show is already scheduled on this screen during these hours."
      );
    }

    const show = await Show.create({
      movie,
      theater,
      screen,
      showDate,
      startTime,
      endTime,
      ticketPrice,
    });

    const populated = await Show.findById(show._id)
      .populate("movie")
      .populate("theater")
      .populate("screen");

    return sendSuccess(res, 201, "Show scheduled successfully", populated);
  } catch (error) {
    next(error);
  }
};

export const updateShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const show = await Show.findById(id);
    if (!show) {
      return sendError(res, 404, "Show not found");
    }

    const screen = data.screen || show.screen;
    const showDate = data.showDate || show.showDate;
    const startTime = data.startTime || show.startTime;
    const endTime = data.endTime || show.endTime;

    if (startTime >= endTime) {
      return sendError(res, 400, "End time must be after start time");
    }

    // Check overlap with other shows
    const otherShows = await Show.find({
      _id: { $ne: id },
      screen,
      showDate,
      status: { $ne: "cancelled" },
    });

    const hasConflict = otherShows.some((existing) => {
      return timesOverlap(startTime, endTime, existing.startTime, existing.endTime);
    });

    if (hasConflict) {
      return sendError(res, 409, "Scheduling Conflict with another show on this screen.");
    }

    const updated = await Show.findByIdAndUpdate(id, data, { returnDocument: "after" })
      .populate("movie")
      .populate("theater")
      .populate("screen");

    return sendSuccess(res, 200, "Show updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const show = await Show.findByIdAndUpdate(id, { status: "cancelled" }, { returnDocument: "after" });
    if (!show) {
      return sendError(res, 404, "Show not found");
    }
    return sendSuccess(res, 200, "Show cancelled successfully", show);
  } catch (error) {
    next(error);
  }
};

// --- 7. USERS MANAGEMENT ---
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select("-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 200, "Users fetched", {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (user.role === "admin") {
      return sendError(res, 400, "Cannot deactivate admin user");
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(res, 200, `User account ${user.isActive ? "activated" : "deactivated"}`, user);
  } catch (error) {
    next(error);
  }
};

// --- 8. BOOKINGS MANAGEMENT ---
export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;
    if (search) {
      query.bookingId = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("user", "name email phone")
        .populate("movie", "title poster")
        .populate("theater", "name city")
        .populate("screen", "name")
        .populate("show", "showDate startTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    return sendSuccess(res, 200, "All bookings fetched", {
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- 9. REVIEWS MODERATION ---
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, 200, "Reviews fetched for moderation", reviews);
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    return sendSuccess(res, 200, "Review deleted by admin");
  } catch (error) {
    next(error);
  }
};

// --- 10. REPORTS & ANALYTICS ---
export const getReports = async (req, res, next) => {
  try {
    // Top 5 grossing movies
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: "confirmed" } },
      { $group: { _id: "$movie", revenue: { $sum: "$totalAmount" }, bookings: { $sum: 1 }, tickets: { $sum: "$ticketCount" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $project: {
          title: "$movie.title",
          revenue: 1,
          bookings: 1,
          tickets: 1,
        },
      },
    ]);

    // Theater performance
    const theaterPerformance = await Booking.aggregate([
      { $match: { bookingStatus: "confirmed" } },
      { $group: { _id: "$theater", revenue: { $sum: "$totalAmount" }, totalBookings: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "theaters",
          localField: "_id",
          foreignField: "_id",
          as: "theater",
        },
      },
      { $unwind: "$theater" },
      {
        $project: {
          name: "$theater.name",
          city: "$theater.city",
          revenue: 1,
          totalBookings: 1,
        },
      },
    ]);

    // Status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 200, "Analytics reports fetched", {
      topMovies,
      theaterPerformance,
      statusBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

