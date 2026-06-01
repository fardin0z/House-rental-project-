import { z } from "zod";
import { parseIdentifier } from "@/lib/auth/identifier";

export const submitMovingInput = z.object({
  name: z.string().min(2, "নাম দিন").max(80),
  phone: z
    .string()
    .min(1, "মোবাইল নম্বর দিন")
    .refine((value) => {
      const parsed = parseIdentifier(value);
      return parsed?.kind === "phone";
    }, "বৈধ মোবাইল নম্বর দিন"),
  fromArea: z.string().min(2, "যেখান থেকে দিন").max(160),
  toArea: z.string().min(2, "যেখানে যাবেন দিন").max(160),
  flatDetails: z.string().max(800).optional().nullable(),
  requestedDate: z
    .string()
    .optional()
    .nullable()
    .refine((value) => {
      if (!value) return true;
      const date = new Date(value);
      return Number.isFinite(date.getTime());
    }, "বৈধ তারিখ দিন"),
});

export type SubmitMovingInput = z.infer<typeof submitMovingInput>;
