import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response } = await updateSupabaseSession(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
