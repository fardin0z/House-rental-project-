import { z } from "zod";

export const roleSchema = z.enum(["tenant", "landlord"]);

export const setRoleInput = z.object({
  role: roleSchema,
});

export const idDocumentTypeSchema = z.enum([
  "nid",
  "birth_certificate",
  "passport",
  "driving_license",
  "student_id",
  "other",
]);

export const submitNidInput = z.object({
  documentType: idDocumentTypeSchema,
  frontPath: z.string().min(1, "সামনের ছবি প্রয়োজন"),
  backPath: z.string().min(1, "পেছনের ছবি প্রয়োজন"),
  selfiePath: z.string().min(1, "সেলফি প্রয়োজন"),
});

export type SetRoleInput = z.infer<typeof setRoleInput>;
export type SubmitNidInput = z.infer<typeof submitNidInput>;
