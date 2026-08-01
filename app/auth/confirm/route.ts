import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const nextRaw = searchParams.get("next") ?? "/verify-email?status=verified";
  const next = nextRaw.startsWith("/") ? nextRaw : "/verify-email?status=verified";

  const supabase = await getSupabaseServerClient();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(
      `${origin}/verify-email?status=error&reason=${encodeURIComponent(error.message)}`,
    );
  }

  const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
  const typeParam = searchParams.get("type");
  const type =
    typeParam && (ALLOWED_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as EmailOtpType)
      : null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(
      `${origin}/verify-email?status=error&reason=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/verify-email?status=error&reason=${encodeURIComponent("missing token")}`,
  );
}
