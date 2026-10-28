import { z } from "zod";

export const createScreenSchema = z.object({
  name: z.string().min(1, "Screen name is required"),
  theater: z.string().min(1, "Theater ID is required"),
  screenType: z.enum(["Standard", "IMAX", "3D", "4DX", "Premium"]).default("Standard"),
  totalSeats: z.coerce.number().optional().default(0),
  status: z.enum(["active", "maintenance"]).default("active"),
});

export const updateScreenSchema = createScreenSchema.partial();

