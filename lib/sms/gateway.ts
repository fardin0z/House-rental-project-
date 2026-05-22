import { createAlphaSmsGateway } from "./alpha-sms";
import { createConsoleSmsGateway } from "./console";
import { createMimSmsGateway } from "./mim-sms";
import type { SmsGateway, SmsProvider } from "./types";

let cached: SmsGateway | null = null;

export function getSmsGateway(): SmsGateway {
  if (cached) return cached;

  const provider = (process.env.SMS_GATEWAY_PROVIDER as SmsProvider) ?? "console";
  const apiKey = process.env.SMS_GATEWAY_API_KEY ?? "";
  const senderId = process.env.SMS_GATEWAY_SENDER_ID ?? "";

  if (provider !== "console" && !apiKey) {
    throw new Error("SMS_GATEWAY_API_KEY is required when SMS_GATEWAY_PROVIDER is set");
  }

  switch (provider) {
    case "alpha":
      cached = createAlphaSmsGateway({ apiKey, senderId: senderId || undefined });
      break;
    case "mim":
      cached = createMimSmsGateway({ apiKey, senderId });
      break;
    default:
      cached = createConsoleSmsGateway();
  }

  return cached;
}
