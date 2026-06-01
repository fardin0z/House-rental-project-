import { NextResponse, type NextRequest } from "next/server";
import { markTransactionFailed } from "@/lib/payments/transactions";
import { parseAamarpayCallback } from "../_lib/parse-callback";

async function handle(request: NextRequest) {
  const { payload, tranId } = await parseAamarpayCallback(request);
  if (tranId) {
    await markTransactionFailed(tranId, payload);
  }
  const target = new URL("/subscription", request.url);
  target.searchParams.set("status", "fail");
  return NextResponse.redirect(target, 303);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
