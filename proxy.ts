import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { CANONICAL_HOST } from "@/lib/seo/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const hostname = host.split(":")[0] ?? "";

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

  const { response } = await updateSupabaseSession(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
