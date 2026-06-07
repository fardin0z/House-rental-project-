import type { UserRole } from "@/types/database.types";

const ROLE_PATHS: Record<UserRole, string> = {
  admin: "/admin",
  landlord: "/listings",
  tenant: "/properties",
};

export function redirectPathForRole(role: UserRole | null | undefined): string {
  if (!role) return "/properties";
  return ROLE_PATHS[role] ?? "/properties";
}

export function roleFromClaims(
  claims: Record<string, unknown> | null | undefined,
): UserRole | null {
  if (!claims) return null;
  const appMeta = claims.app_metadata as { role?: string } | undefined;
  const candidate = appMeta?.role;
  if (candidate === "admin" || candidate === "landlord" || candidate === "tenant") {
    return candidate;
  }
  return null;
}

export function roleFromJwt(jwt: string): UserRole | null {
  try {
    const [, payloadB64] = jwt.split(".");
    if (!payloadB64) return null;
    const padded =
      payloadB64.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    return roleFromClaims(payload);
  } catch {
    return null;
  }
}
