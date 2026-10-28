import Theater from "../models/Theater.js";
import Screen from "../models/Screen.js";
import Show from "../models/Show.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getTheaters = async (req, res, next) => {
  try {
    const { city, status = "active" } = req.query;
    const query = {};
    if (status) query.status = status;
    if (city) query.city = new RegExp(`^${city}$`, "i");

    const theaters = await Theater.find(query).sort({ name: 1 });
    return sendSuccess(res, 200, "Theaters fetched", theaters);
  } catch (error) {
    next(error);
  }
};

export const getTheaterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);
    if (!theater) {
      return sendError(res, 404, "Theater not found");
    }

    const screens = await Screen.find({ theater: id });
    const todayStr = new Date().toISOString().split("T")[0];
    const shows = await Show.find({
      theater: id,
      showDate: { $gte: todayStr },
      status: "scheduled",
    }).populate("movie").populate("screen");

    return sendSuccess(res, 200, "Theater details fetched", {
      theater,
      screens,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (req, res, next) => {
  try {
    const cities = await Theater.distinct("city", { status: "active" });
    return sendSuccess(res, 200, "Cities fetched", cities);
  } catch (error) {
    next(error);
  }
};

