import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { getSmsGateway } from "@/lib/sms/gateway";

type SmsHookPayload = {
  user: { id: string; phone: string };
  sms: { otp: string };
};

export async function POST(request: Request) {
  const secret = process.env.SEND_SMS_HOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SEND_SMS_HOOK_SECRET not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let payload: SmsHookPayload;
  try {
    const wh = new Webhook(secret.replace(/^v1,whsec_/, ""));
    payload = wh.verify(rawBody, headers) as SmsHookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const gateway = getSmsGateway();
  const message = buildOtpMessage(payload.sms.otp);

  try {
    await gateway.send({ to: payload.user.phone, body: message });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SMS send failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function buildOtpMessage(otp: string): string {
  return `বাসাভাড়া OTP: ${otp}\nএই কোড কাউকে দিবেন না। মেয়াদ ৫ মিনিট।`;
}
