import { NextResponse, type NextRequest } from "next/server";
import { markTransactionSuccessful } from "@/lib/payments/transactions";
import { parseAamarpayCallback } from "../_lib/parse-callback";

async function handle(request: NextRequest) {
  const { payload, tranId } = await parseAamarpayCallback(request);

  let bannerStatus: "success" | "fail" = "fail";
  if (tranId) {
    const outcome = await markTransactionSuccessful(tranId, payload, {
      verify: true,
    });
    if (outcome.kind === "completed" || outcome.kind === "already") {
      bannerStatus = "success";
    } else {
      console.warn("[aamarpay/success] verify rejected", { tranId, outcome });
    }
  }

  const target = new URL("/subscription", request.url);
  target.searchParams.set("status", bannerStatus);
  return NextResponse.redirect(target, 303);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
