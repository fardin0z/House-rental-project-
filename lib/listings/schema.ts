import { z } from "zod";

export const rentalTypeSchema = z.enum([
  "family_flat",
  "bachelor",
  "sublet",
  "shop",
  "office",
]);

export const listingFormInput = z.object({
  title: z.string().min(4, "শিরোনাম কমপক্ষে ৪ অক্ষরের হতে হবে").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  rental_type: rentalTypeSchema,
  rent: z.coerce.number().int("পূর্ণ সংখ্যা দিন").min(500, "ভাড়া কমপক্ষে ৫০০ টাকা").max(10_000_000),
  beds: z.coerce.number().int().min(0).max(20).optional().or(z.nan()),
  baths: z.coerce.number().int().min(0).max(20).optional().or(z.nan()),
  area_sqft: z.coerce.number().int().min(0).max(50_000).optional().or(z.nan()),
  area_name: z.string().min(2, "এলাকার নাম দিন").max(120),
  division: z.string().max(80).optional().or(z.literal("")),
  district: z.string().max(80).optional().or(z.literal("")),
});

export type ListingFormInput = z.infer<typeof listingFormInput>;

export const listingImageInput = z.object({
  listing_id: z.string().uuid(),
  path: z.string().min(1),
  sort_order: z.coerce.number().int().min(0).max(50).default(0),
});

export type ListingImageInput = z.infer<typeof listingImageInput>;
