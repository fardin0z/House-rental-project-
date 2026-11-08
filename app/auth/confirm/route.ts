import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirectPathForRole } from "@/lib/auth/jwt-claims";
import type { UserRole } from "@/types/database.types";

const ALLOWED_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

const SOCIAL_ROLES = new Set<UserRole>(["tenant", "landlord"]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const nextRaw = searchParams.get("next");
  const next = nextRaw?.startsWith("/") ? nextRaw : null;
  const requestedRole = searchParams.get("role") as UserRole | null;
  const socialRole = requestedRole && SOCIAL_ROLES.has(requestedRole) ? requestedRole : null;

  const supabase = await getSupabaseServerClient();
  const code = searchParams.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const admin = getSupabaseAdminClient();
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle();

      const metadata = data.user.user_metadata as Record<string, unknown> | null;
      const name = typeof metadata?.name === "string"
        ? metadata.name
        : typeof metadata?.full_name === "string"
          ? metadata.full_name
          : data.user.email?.split("@")[0] ?? "";
      const role = socialRole ?? existingProfile?.role ?? "tenant";

      if (existingProfile) {
        if (socialRole && existingProfile.role !== socialRole) {
          await admin.from("profiles").update({ role, name }).eq("id", data.user.id);
        }
      } else {
        await admin.from("profiles").insert({
          id: data.user.id,
          email: data.user.email ?? null,
          name,
          role,
        });
      }

      return NextResponse.redirect(`${origin}${next ?? redirectPathForRole(role)}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "OAuth login failed")}`,
    );
  }

  const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
  const typeParam = searchParams.get("type");
  const type =
    typeParam && (ALLOWED_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as EmailOtpType)
      : null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next ?? "/verify-email?status=verified"}`);
    }
    return NextResponse.redirect(
      `${origin}/verify-email?status=error&reason=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/verify-email?status=error&reason=${encodeURIComponent("missing token")}`,
  );
}
