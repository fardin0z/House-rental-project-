import { NextResponse, type NextRequest } from "next/server";
import {
  isWebhookSuccessful,
  verifyWebhookSignature,
  type WebhookPayload,
} from "@/lib/payments/aamarpay";
import {
  markTransactionFailed,
  markTransactionSuccessful,
} from "@/lib/payments/transactions";

export async function POST(request: NextRequest) {
  let payload: WebhookPayload;
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      payload = (await request.json()) as WebhookPayload;
    } else {
      const form = await request.formData();
      payload = {};
      for (const [k, v] of form.entries()) {
        payload[k] = typeof v === "string" ? v : "";
      }
    }
  } catch (error) {
    console.error("[aamarpay/webhook] body parse", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!verifyWebhookSignature(payload)) {
    console.warn("[aamarpay/webhook] bad signature");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const tranId = payload.mer_txnid ?? payload.tran_id;
  if (!tranId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isWebhookSuccessful(payload)) {
    const outcome = await markTransactionFailed(tranId, payload);
    return NextResponse.json({ ok: true, outcome: outcome.kind });
  }

  const outcome = await markTransactionSuccessful(tranId, payload, {
    verify: true,
  });
  if (outcome.kind === "not_found") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  return NextResponse.json({ ok: true, outcome: outcome.kind });
}
