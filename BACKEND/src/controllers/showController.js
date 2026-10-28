import Show from "../models/Show.js";
import { bookingService } from "../services/bookingService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getShows = async (req, res, next) => {
  try {
    const { movie, theater, date } = req.query;
    const query = { status: "scheduled" };

    if (movie) query.movie = movie;
    if (theater) query.theater = theater;
    if (date) query.showDate = date;

    const shows = await Show.find(query)
      .populate("movie")
      .populate("theater")
      .populate("screen")
      .sort({ showDate: 1, startTime: 1 });

    return sendSuccess(res, 200, "Shows fetched", shows);
  } catch (error) {
    next(error);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const show = await Show.findById(id)
      .populate("movie")
      .populate("theater")
      .populate("screen");

    if (!show) {
      return sendError(res, 404, "Show not found");
    }

    return sendSuccess(res, 200, "Show fetched", show);
  } catch (error) {
    next(error);
  }
};

export const getShowSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    const seatMap = await bookingService.getShowSeatMap(showId, currentUserId);
    return sendSuccess(res, 200, "Seat map fetched", seatMap);
  } catch (error) {
    next(error);
  }
};

