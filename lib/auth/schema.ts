import { z } from "zod";
import { isValidBdPhone, normalizeBdPhone } from "./phone";

export const phoneSchema = z
  .string()
  .min(1, "মোবাইল নম্বর দিন")
  .transform(normalizeBdPhone)
  .refine(isValidBdPhone, "বৈধ বাংলাদেশী মোবাইল নম্বর দিন");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "৬ ডিজিটের কোড দিন");

export const sendOtpInput = z.object({
  phone: phoneSchema,
});

export const verifyOtpInput = z.object({
  phone: phoneSchema,
  token: otpSchema,
});

export type SendOtpInput = z.infer<typeof sendOtpInput>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;
