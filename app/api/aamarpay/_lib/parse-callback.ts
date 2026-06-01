import type { NextRequest } from "next/server";

export type CallbackPayload = Record<string, string>;

export async function parseAamarpayCallback(
  request: NextRequest,
): Promise<{ payload: CallbackPayload; tranId: string | null }> {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: CallbackPayload = {};

  if (request.method === "POST") {
    try {
      if (contentType.includes("application/json")) {
        const json = (await request.json()) as Record<string, unknown>;
        for (const [k, v] of Object.entries(json)) {
          payload[k] = typeof v === "string" ? v : String(v ?? "");
        }
      } else {
        const form = await request.formData();
        for (const [k, v] of form.entries()) {
          payload[k] = typeof v === "string" ? v : "";
        }
      }
    } catch (error) {
      console.error("[aamarpay] parse body", error);
    }
  }

  const url = new URL(request.url);
  for (const [k, v] of url.searchParams.entries()) {
    if (payload[k] === undefined) payload[k] = v;
  }

  const tranId =
    payload.mer_txnid ??
    payload.tran_id ??
    url.searchParams.get("tran") ??
    null;

  return { payload, tranId };
}
