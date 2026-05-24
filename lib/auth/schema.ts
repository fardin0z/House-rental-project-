import { z } from "zod";
import { parseIdentifier } from "./identifier";

const identifierSchema = z
  .string()
  .min(1, "মোবাইল নম্বর বা ইমেইল দিন")
  .refine((value) => parseIdentifier(value) !== null, "বৈধ মোবাইল নম্বর বা ইমেইল দিন");

const passwordSchema = z
  .string()
  .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
  .max(72, "পাসওয়ার্ড অনেক বড়");

export const loginInput = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export const signupInput = z.object({
  name: z.string().min(2, "নাম দিন").max(80),
  identifier: identifierSchema,
  password: passwordSchema,
});

export const resetRequestInput = z.object({
  email: z.string().email("বৈধ ইমেইল দিন"),
});

export const updatePasswordInput = z.object({
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginInput>;
export type SignupInput = z.infer<typeof signupInput>;
