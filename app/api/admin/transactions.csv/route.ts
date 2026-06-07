import { getCurrentProfile } from "@/lib/auth/guards";
import { getAdminTransactions } from "@/lib/admin/queries";

const STATUSES = ["pending", "completed", "failed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return new Response("forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const rawStatus = url.searchParams.get("status");
  const status: Status | null = STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : null;

  const txns = await getAdminTransactions({ status, limit: 5000 });

  const headers = [
    "id",
    "user_id",
    "user_name",
    "user_phone",
    "user_email",
    "amount",
    "currency",
    "status",
    "aamarpay_transaction_id",
    "provider_transaction_id",
    "created_at",
  ];

  const lines = [headers.join(",")];
  for (const t of txns) {
    lines.push(
      [
        t.id,
        t.user_id,
        t.user.name,
        t.user.phone,
        t.user.email,
        t.amount,
        t.currency,
        t.status,
        t.aamarpay_transaction_id,
        t.provider_transaction_id,
        t.created_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const body = lines.join("\n");
  const filename = `toletzoo-transactions-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
