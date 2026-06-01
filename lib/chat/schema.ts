import { z } from "zod";

export const sendMessageInput = z
  .object({
    conversationId: z.string().uuid(),
    body: z.string().max(2000, "মেসেজ অনেক বড়").optional().nullable(),
    attachmentPath: z.string().max(500).optional().nullable(),
    attachmentType: z.string().max(120).optional().nullable(),
    attachmentName: z.string().max(255).optional().nullable(),
  })
  .refine(
    (data) =>
      (data.body && data.body.trim().length > 0) ||
      (data.attachmentPath && data.attachmentPath.length > 0),
    { message: "মেসেজ অথবা ফাইল যোগ করুন", path: ["body"] },
  );

export type SendMessageInput = z.infer<typeof sendMessageInput>;
