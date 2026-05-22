import type { SmsGateway, SmsMessage } from "./types";

export function createConsoleSmsGateway(): SmsGateway {
  return {
    async send({ to, body }: SmsMessage) {
      console.info(`[sms:console] -> ${to}: ${body}`);
    },
  };
}
