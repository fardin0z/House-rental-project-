import { NextResponse, type NextRequest } from "next/server";
import { verifyStandardWebhook } from "@/lib/sms/webhook-signature";
import { buildOtpMessage, sendSms } from "@/lib/sms/gateway";
import { normalizeBdPhone, isValidBdPhone } from "@/lib/auth/phone";

type SendSmsHookPayload = {
  user?: { id?: string; phone?: string | null };
  sms?: { otp?: string };
};

function hookError(message: string, status: number) {
  return NextResponse.json(
    { error: { http_code: status, message } },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_SEND_SMS_HOOK_SECRET;
  if (!secret) {
    console.error("[send-sms-hook] SUPABASE_SEND_SMS_HOOK_SECRET missing");
    return hookError("SMS hook not configured", 500);
  }

  const rawBody = await request.text();
  const valid = verifyStandardWebhook(
    rawBody,
    {
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    },
    secret,
  );
  if (!valid) return hookError("Invalid signature", 401);

  let payload: SendSmsHookPayload;
  try {
    payload = JSON.parse(rawBody) as SendSmsHookPayload;
  } catch {
    return hookError("Invalid payload", 400);
  }

  const otp = payload.sms?.otp?.trim();
  const phone = normalizeBdPhone(payload.user?.phone ?? "");
  if (!otp || !isValidBdPhone(phone)) {
    return hookError("Missing phone or otp", 400);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[otp:dev] phone=${phone} code=${otp}`);
  }

  const result = await sendSms(phone, buildOtpMessage(otp));
  if (!result.ok) {
    console.error("[send-sms-hook] delivery failed", result);
    return hookError(result.error, 500);
  }

  return NextResponse.json({});
}
