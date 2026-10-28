import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Screen name is required"],
      trim: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: [true, "Theater reference is required"],
      index: true,
    },
    screenType: {
      type: String,
      enum: ["Standard", "IMAX", "3D", "4DX", "Premium"],
      default: "Standard",
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "maintenance"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Screen = mongoose.model("Screen", screenSchema);
export default Screen;

