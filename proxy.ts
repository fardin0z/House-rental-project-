import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { CANONICAL_HOST } from "@/lib/seo/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const hostname = host.split(":")[0] ?? "";

  if (request.nextUrl.pathname === "/") {
    const params = request.nextUrl.searchParams;
    const code = params.get("code");
    const errorCode = params.get("error");
    const errorDesc = params.get("error_description");

    if (code) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/confirm";
      if (!url.searchParams.get("next")) {
        url.searchParams.set("next", "/verify-email?status=verified");
      }
      return NextResponse.redirect(url);
    }

    if (errorCode || errorDesc) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      url.search = "";
      url.searchParams.set("status", "error");
      url.searchParams.set("reason", errorDesc ?? errorCode ?? "auth failed");
      return NextResponse.redirect(url);
    }
  }

  if (hostname && !LOCAL_HOSTS.has(hostname)) {
    const targetHost = hostname.startsWith("www.")
      ? hostname.slice(4)
      : hostname;
    const isCanonicalHost = targetHost === CANONICAL_HOST;
    const forwardedProto = (
      request.headers.get("x-forwarded-proto") ?? ""
    ).toLowerCase();
    const isHttps =
      request.nextUrl.protocol === "https:" || forwardedProto === "https";
    const needsHostRewrite = isCanonicalHost && hostname !== CANONICAL_HOST;
    const needsHttps = isCanonicalHost && !isHttps;

    if (needsHostRewrite || needsHttps) {
      const url = new URL(request.url);
      url.protocol = "https:";
      url.host = CANONICAL_HOST;
      url.port = "";
      return NextResponse.redirect(url, 308);
    }
  }

  const { response, userId, claims } = await updateSupabaseSession(request);

  if (userId) {
    const pathname = request.nextUrl.pathname;
    const isAllowedWhileUnverified =
      pathname === "/" ||
      pathname === "/verify-phone" ||
      pathname.startsWith("/verify-phone/") ||
      pathname.startsWith("/auth/") ||
      pathname === "/logout" ||
      pathname === "/api/auth/signout";

    if (!isAllowedWhileUnverified) {
      const appMeta = (claims?.app_metadata ?? {}) as {
        phone_verified?: boolean;
      };
      const phoneVerifiedClaim = appMeta.phone_verified;

      let mustVerify = false;
      let phoneForRedirect = "";

      if (phoneVerifiedClaim === false) {
        mustVerify = true;
        const phoneClaim = (claims?.phone ?? "") as string;
        phoneForRedirect = phoneClaim;
      } else if (phoneVerifiedClaim === undefined) {
        try {
          const { getSupabaseAdminClient } = await import(
            "@/lib/supabase/admin"
          );
          const admin = getSupabaseAdminClient();
          const { data } = await admin
            .from("profiles")
            .select("phone, phone_verified_at")
            .eq("id", userId)
            .maybeSingle();
          const row = data as
            | { phone: string | null; phone_verified_at: string | null }
            | null;
          if (row?.phone && !row.phone_verified_at) {
            mustVerify = true;
            phoneForRedirect = row.phone;
          }
        } catch (e) {
          console.error("[proxy] phone-verify check failed", e);
        }
      }

      if (mustVerify) {
        const url = request.nextUrl.clone();
        url.pathname = "/verify-phone";
        url.search = "";
        if (phoneForRedirect) url.searchParams.set("phone", phoneForRedirect);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
