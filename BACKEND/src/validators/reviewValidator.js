import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5),
  review: z.string().min(3, "Review must be at least 3 characters").max(1000),
});

