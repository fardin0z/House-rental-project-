export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsGateway {
  send(message: SmsMessage): Promise<void>;
}

export type SmsProvider = "alpha" | "mim" | "console";
