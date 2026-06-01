const SANDBOX_BASE = "https://sandbox.aamarpay.com";
const LIVE_BASE = "https://secure.aamarpay.com";

export const PREMIUM_AMOUNT_BDT = 299;
export const PREMIUM_DAYS = 30;

function baseUrl(): string {
  return process.env.AAMARPAY_BASE_URL ?? SANDBOX_BASE;
}

export function isLiveMode(): boolean {
  return baseUrl() === LIVE_BASE;
}

export function aamarpayCredentials(): {
  storeId: string;
  signatureKey: string;
} {
  const live = isLiveMode();
  const storeId =
    process.env.AAMARPAY_STORE_ID || (live ? "" : "aamarpaytest");
  const signatureKey =
    process.env.AAMARPAY_SIGNATURE_KEY ||
    (live ? "" : "dbb74894e82415a2f7ff0ec3a97e4183");
  return { storeId, signatureKey };
}

export type InitiateInput = {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  tranId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  description: string;
};

export type InitiateResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; error: string };

export async function initiateAamarpayPayment(
  input: InitiateInput,
): Promise<InitiateResult> {
  const { storeId, signatureKey } = aamarpayCredentials();
  if (!storeId || !signatureKey) {
    return { ok: false, error: "AamarPay credentials missing" };
  }

  const body = {
    store_id: storeId,
    signature_key: signatureKey,
    tran_id: input.tranId,
    amount: input.amount.toFixed(2),
    currency: "BDT",
    desc: input.description,
    cus_name: input.customerName,
    cus_email: input.customerEmail || "noreply@toletzoo.com",
    cus_phone: input.customerPhone || "01700000000",
    cus_add1: input.customerAddress ?? "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    success_url: input.successUrl,
    fail_url: input.failUrl,
    cancel_url: input.cancelUrl,
    type: "json",
  };

  const res = await fetch(`${baseUrl()}/jsonpost.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[aamarpay.initiate] HTTP", res.status, text);
    return { ok: false, error: `AamarPay initiate HTTP ${res.status}` };
  }

  const text = await res.text();
  let json: Record<string, string> = {};
  try {
    json = JSON.parse(text) as Record<string, string>;
  } catch {
    console.error("[aamarpay.initiate] non-JSON response:", text);
    return { ok: false, error: "AamarPay returned non-JSON" };
  }

  if (json.result === "true" && typeof json.payment_url === "string") {
    return { ok: true, paymentUrl: json.payment_url };
  }

  console.error("[aamarpay.initiate] rejected:", json);
  const message =
    json.error_msg ||
    json.error ||
    (json.result === "false" ? "AamarPay rejected the request" : `result=${json.result}`);
  return { ok: false, error: message };
}

export type WebhookPayload = Record<string, string>;

export function verifyWebhookSignature(payload: WebhookPayload): boolean {
  const { signatureKey } = aamarpayCredentials();
  if (!signatureKey) return false;
  const received = payload.signature_key ?? payload.store_passwd ?? "";
  return received === signatureKey;
}

export function isWebhookSuccessful(payload: WebhookPayload): boolean {
  if (payload.status_code === "2") return true;
  if (payload.status_code === "7") return false;
  const status = (payload.pay_status ?? payload.status ?? "").toLowerCase();
  return status === "successful" || status === "completed";
}

export function makeTransactionId(): string {
  const random = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
  return `TZ-${Date.now().toString(36).toUpperCase()}-${random.toUpperCase()}`;
}

export type SearchTransactionResult =
  | {
      ok: true;
      verified: boolean;
      statusCode: string;
      payStatus: string;
      amount: string;
      errorCode: string;
      raw: Record<string, string>;
    }
  | { ok: false; error: string };

export async function searchTransaction(
  tranId: string,
): Promise<SearchTransactionResult> {
  const { storeId, signatureKey } = aamarpayCredentials();
  if (!storeId || !signatureKey) {
    return { ok: false, error: "AamarPay credentials missing" };
  }

  const url = new URL(`${baseUrl()}/api/v1/trxcheck/request.php`);
  url.searchParams.set("request_id", tranId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("signature_key", signatureKey);
  url.searchParams.set("type", "json");

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false, error: `Search HTTP ${res.status}` };
  }

  let raw: Record<string, string> = {};
  try {
    const parsed = (await res.json()) as Record<string, unknown>;
    for (const [k, v] of Object.entries(parsed)) {
      raw[k] = typeof v === "string" ? v : String(v ?? "");
    }
  } catch (error) {
    return { ok: false, error: "Search response not JSON" };
  }

  const statusCode = raw.status_code ?? "";
  const payStatus = raw.pay_status ?? "";
  const amount = raw.amount ?? "";
  const errorCode = raw.error_code ?? "";

  console.log("[aamarpay.searchTransaction] raw response:", raw);

  const verified = statusCode === "2";

  return { ok: true, verified, statusCode, payStatus, amount, errorCode, raw };
}
