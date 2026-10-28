import { z } from "zod";

export const createTheaterSchema = z.object({
  name: z.string().min(2, "Theater name is required"),
  location: z.string().min(2, "Location is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  facilities: z.array(z.string()).optional().default([]),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateTheaterSchema = createTheaterSchema.partial();

