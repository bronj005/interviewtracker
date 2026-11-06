import { z } from "zod";
import { PROFILE_COLORS } from "@/lib/colors";
import { isValidISODate } from "@/lib/dates";
import { METRIC_KEYS } from "@/lib/metrics";

const isoDate = z
  .string()
  .refine(isValidISODate, { message: "Date must be a valid YYYY-MM-DD value" });

const profileName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(40, "Name must be 40 characters or less");

const profileColor = z.enum(PROFILE_COLORS, { message: "Pick a color from the palette" });

export const createProfileSchema = z.object({
  name: profileName,
  color: profileColor.optional(),
});

export const updateProfileSchema = z
  .object({ name: profileName.optional(), color: profileColor.optional() })
  .refine((v) => v.name !== undefined || v.color !== undefined, {
    message: "Nothing to update",
  });

export const adjustCountSchema = z.object({
  profileId: z.string().min(1, "profileId is required"),
  date: isoDate,
  metric: z.enum(METRIC_KEYS),
  delta: z
    .number()
    .int()
    .min(-50)
    .max(50)
    .refine((n) => n !== 0, { message: "delta cannot be 0" }),
});

export const countsRangeSchema = z
  .object({ from: isoDate, to: isoDate })
  .refine((v) => v.from <= v.to, { message: "`from` must be on or before `to`" });

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdjustCountInput = z.infer<typeof adjustCountSchema>;
