const TTL_MS = 5 * 60 * 1000;

type Entry = { code: string; expiresAt: number };

const globalKey = Symbol.for("basavara.devOtps");
type GlobalWithStore = typeof globalThis & { [key: symbol]: Map<string, Entry> };

function getStore(): Map<string, Entry> {
  const g = globalThis as GlobalWithStore;
  if (!g[globalKey]) {
    g[globalKey] = new Map<string, Entry>();
  }
  return g[globalKey];
}

export function isDevOtpEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_OTP === "true"
  );
}

export function generateDevOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function storeDevOtp(phone: string, code: string): void {
  getStore().set(phone, { code, expiresAt: Date.now() + TTL_MS });
}

export function consumeDevOtp(phone: string, code: string): boolean {
  const store = getStore();
  const entry = store.get(phone);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(phone);
  return true;
}

export function peekDevOtp(phone: string): string | null {
  const store = getStore();
  const entry = store.get(phone);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(phone);
    return null;
  }
  return entry.code;
}

export function devEmailForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `dev-${digits}@basavara.local`;
}

export function devPasswordForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `dev-${digits}-basavara-2026-static`;
}
