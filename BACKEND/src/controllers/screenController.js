import Screen from "../models/Screen.js";
import Seat from "../models/Seat.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getScreensByTheater = async (req, res, next) => {
  try {
    const { theaterId } = req.params;
    const screens = await Screen.find({ theater: theaterId }).sort({ name: 1 });
    return sendSuccess(res, 200, "Screens fetched", screens);
  } catch (error) {
    next(error);
  }
};

export const getScreenById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findById(id).populate("theater");
    if (!screen) {
      return sendError(res, 404, "Screen not found");
    }

    const seats = await Seat.find({ screen: id }).sort({ row: 1, seatNumber: 1 });

    return sendSuccess(res, 200, "Screen details fetched", {
      screen,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

