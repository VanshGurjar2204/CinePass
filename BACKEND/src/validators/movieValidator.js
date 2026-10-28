import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  genre: z.array(z.string()).min(1, "At least one genre is required"),
  language: z.string().min(1, "Language is required"),
  duration: z.coerce.number().min(1, "Duration must be greater than 0"),
  cast: z.array(z.string()).optional().default([]),
  director: z.string().optional().default(""),
  releaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  poster: z.string().url("Poster must be a valid URL"),
  backdrop: z.string().url("Backdrop must be a valid URL").optional().or(z.literal("")),
  trailerUrl: z.string().url("Trailer must be a valid URL").optional().or(z.literal("")),
  certificate: z.string().optional().default("U/A"),
  status: z.enum(["now_showing", "upcoming", "ended"]).default("now_showing"),
  featured: z.boolean().optional().default(false),
});

export const updateMovieSchema = createMovieSchema.partial();

