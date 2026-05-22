import type { SmsGateway, SmsMessage } from "./types";

const MIM_SMS_ENDPOINT = "https://api.mimsms.com/api/SmsSending/SMS";

export function createMimSmsGateway(config: {
  apiKey: string;
  senderId: string;
}): SmsGateway {
  return {
    async send({ to, body }: SmsMessage) {
      const res = await fetch(MIM_SMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserName: config.apiKey,
          Apikey: config.apiKey,
          MobileNumber: to,
          CampaignId: "null",
          SenderName: config.senderId,
          TransactionType: "T",
          Message: body,
        }),
      });

      if (!res.ok) {
        throw new Error(`Mim SMS failed: ${res.status} ${await res.text()}`);
      }

      const data = (await res.json()) as { statusCode?: string; status?: string };
      if (data.statusCode && data.statusCode !== "200") {
        throw new Error(`Mim SMS error ${data.statusCode}: ${data.status ?? "unknown"}`);
      }
    },
  };
}
