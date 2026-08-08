const BASE_URL = "https://api.sms.net.bd";

export type SmsResult =
  | { ok: true; requestId?: string }
  | { ok: false; error: string; code?: number };

type SendResponse = {
  error?: number;
  msg?: string;
  data?: { request_id?: number | string };
};

export async function sendSms(
  to: string,
  message: string,
): Promise<SmsResult> {
  const apiKey = process.env.SMS_NET_BD_API_KEY;
  if (!apiKey) {
    console.error("[sms] SMS_NET_BD_API_KEY missing");
    return { ok: false, error: "SMS পরিষেবা কনফিগার করা হয়নি" };
  }

  const normalizedTo = to.replace(/^\+/, "");

  const body = new URLSearchParams();
  body.set("api_key", apiKey);
  body.set("to", normalizedTo);
  body.set("msg", message);

  const sender = process.env.SMS_NET_BD_SENDER_ID;
  if (sender) body.set("sender_id", sender);

  try {
    const res = await fetch(`${BASE_URL}/sendsms`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const json = (await res.json().catch(() => null)) as SendResponse | null;

    if (!res.ok || !json) {
      console.error("[sms] http error", { status: res.status, body: json });
      return {
        ok: false,
        error: "SMS পাঠাতে সমস্যা হয়েছে",
        code: res.status,
      };
    }

    if (json.error && json.error !== 0) {
      console.error("[sms] api error", json);
      return {
        ok: false,
        error: mapSmsError(json.error, json.msg),
        code: json.error,
      };
    }

    console.log("[sms] sent", { to: normalizedTo, requestId: json.data?.request_id });

    return {
      ok: true,
      requestId: json.data?.request_id
        ? String(json.data.request_id)
        : undefined,
    };
  } catch (e) {
    console.error("[sms] send failed", e);
    return { ok: false, error: "SMS পাঠাতে সমস্যা হয়েছে" };
  }
}

function mapSmsError(code: number, msg?: string): string {
  switch (code) {
    case 401:
      return "SMS API কী ভুল";
    case 402:
      return "SMS ব্যালেন্স শেষ";
    case 403:
      return "IP অনুমোদিত নয়";
    case 404:
      return "SMS বার্তা খালি";
    case 405:
    case 406:
      return "মোবাইল নম্বর ভুল";
    case 409:
      return "SMS ব্লক করা হয়েছে";
    default:
      return msg ?? "SMS পাঠাতে সমস্যা হয়েছে";
  }
}

export function buildOtpMessage(code: string): string {
  const brand = process.env.SMS_NET_BD_BRAND_NAME ?? "ToletZoo";
  return `${brand}: আপনার যাচাইকরণ কোড ${code}। কোডটি ৫ মিনিট বৈধ। কারও সাথে শেয়ার করবেন না।`;
}
