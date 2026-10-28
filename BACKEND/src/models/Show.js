import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
      index: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Theater is required"],
      index: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Screen is required"],
      index: true,
    },
    showDate: {
      type: String, // format YYYY-MM-DD for easy querying
      required: [true, "Show date is required"],
      index: true,
    },
    startTime: {
      type: String, // format "HH:MM" e.g. "14:30"
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String, // format "HH:MM" e.g. "17:15"
      required: [true, "End time is required"],
    },
    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for schedule lookup and collision detection
showSchema.index({ screen: 1, showDate: 1, status: 1 });
showSchema.index({ movie: 1, showDate: 1 });

const Show = mongoose.model("Show", showSchema);
export default Show;

