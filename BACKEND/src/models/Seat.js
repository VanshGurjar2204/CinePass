import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: [true, "Screen reference is required"],
      index: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Theater reference is required"],
      index: true,
    },
    row: {
      type: String,
      required: [true, "Row is required"],
      trim: true,
      uppercase: true,
    },
    seatNumber: {
      type: Number,
      required: [true, "Seat number is required"],
    },
    seatLabel: {
      type: String,
      required: [true, "Seat label is required"],
      trim: true,
      uppercase: true,
    },
    seatType: {
      type: String,
      enum: ["regular", "premium", "recliner"],
      default: "regular",
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
      min: 1.0,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique seat labels per screen
seatSchema.index({ screen: 1, seatLabel: 1 }, { unique: true });

const Seat = mongoose.model("Seat", seatSchema);
export default Seat;

