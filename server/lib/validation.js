import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid record ID");
const text = (max = 120) => z.string().trim().min(1, "Required").max(max);
export const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
export const contact = z
  .string()
  .trim()
  .regex(/^(?:\+63|0)9\d{9}$/, "Use 09XXXXXXXXX or +639XXXXXXXXX");
export const rfid = z
  .string()
  .trim()
  .regex(/^[a-z\d-]{5,64}$/i, "Use 5–64 letters, numbers, or hyphens")
  .transform((value) => value.toUpperCase());
const date = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      Number.isFinite(Date.parse(value.slice(0, 10) + "T00:00:00Z")) &&
      new Date(value.slice(0, 10) + "T00:00:00Z").toISOString().slice(0, 10) ===
        value.slice(0, 10),
    "Enter a valid date",
  );
const pastDate = date.refine(
  // Birth and vaccination dates follow the clinic's calendar, not UTC midnight.
  (value) =>
    value.slice(0, 10) <=
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(
      new Date(),
    ),
  "Date cannot be in the future",
);
export const vaccination = z.object({
  date: pastDate,
  vaccinationType: text(120),
});
export const profile = z.object({
  name: text(),
  email,
  address: text(500),
  contact,
});
export const signup = profile.extend({
  password: z
    .string()
    .min(8)
    .max(72)
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password must be at most 72 bytes",
    ),
});
export const credentials = z.object({
  email,
  password: z.string().min(1).max(200),
});
export const petInput = z.object({
  name: text(),
  petType: z.enum(["dog", "cat"]),
  breed1: text(),
  breed2: z.string().trim().max(120).default(""),
  dob: pastDate,
  rfidNumber: rfid,
  contact,
  address: text(500),
  email: z.union([email, z.literal("")]).optional(),
  ownerId: objectId.optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  vaccinationHistory: z.array(vaccination).max(200).default([]),
});
export const petUpdate = petInput
  .omit({ ownerId: true, vaccinationHistory: true, breed2: true, status: true })
  .partial()
  .extend({
    breed2: z.string().trim().max(120).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    vaccinationHistory: z.array(vaccination).max(200).optional(),
    version: z.number().int().nonnegative().optional(),
  });
export const noteInput = z.object({
  petId: objectId,
  content: text(5000),
  isPublic: z.boolean(),
});
export const visitInput = z.object({
  petId: objectId,
  date,
  comment: z.string().trim().max(2000).default(""),
});
export const visitUpdate = z.object({
  date: date.optional(),
  comment: z.string().trim().max(2000).optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});
