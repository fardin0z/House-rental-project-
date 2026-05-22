import type { SmsGateway, SmsMessage } from "./types";

const ALPHA_SMS_ENDPOINT = "https://api.sms.net.bd/sendsms";

export function createAlphaSmsGateway(config: {
  apiKey: string;
  senderId?: string;
}): SmsGateway {
  return {
    async send({ to, body }: SmsMessage) {
      const params = new URLSearchParams({
        api_key: config.apiKey,
        msg: body,
        to,
      });
      if (config.senderId) params.set("sender_id", config.senderId);

      const res = await fetch(ALPHA_SMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        throw new Error(`Alpha SMS failed: ${res.status} ${await res.text()}`);
      }

      const data = (await res.json()) as { error?: number; msg?: string };
      if (data.error && data.error !== 0) {
        throw new Error(`Alpha SMS error ${data.error}: ${data.msg ?? "unknown"}`);
      }
    },
  };
}
