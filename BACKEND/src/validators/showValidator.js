import { z } from "zod";

export const createShowSchema = z.object({
  movie: z.string().min(1, "Movie ID is required"),
  theater: z.string().min(1, "Theater ID is required"),
  screen: z.string().min(1, "Screen ID is required"),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM"),
  ticketPrice: z.coerce.number().min(1, "Ticket price must be greater than 0"),
  status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
});

export const updateShowSchema = createShowSchema.partial();

