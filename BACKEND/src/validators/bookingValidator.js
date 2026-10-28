import { z } from "zod";

export const lockSeatsSchema = z.object({
  showId: z.string().min(1, "Show ID is required"),
  seatIds: z.array(z.string()).min(1, "At least one seat must be selected"),
});

export const createBookingSchema = z.object({
  showId: z.string().min(1, "Show ID is required"),
  seatIds: z.array(z.string()).min(1, "At least one seat is required"),
});

