import mongoose from "mongoose";

const seatLockSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
      index: true,
    },
    seatLabel: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index: automatically deletes document once expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: prevents duplicate concurrent locks on the exact same seat for the show
seatLockSchema.index({ show: 1, seat: 1 }, { unique: true });

const SeatLock = mongoose.model("SeatLock", seatLockSchema);
export default SeatLock;

