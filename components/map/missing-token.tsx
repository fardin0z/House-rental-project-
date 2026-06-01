import { MapPinIcon } from "lucide-react";

export function MapboxTokenMissing({ heading }: { heading: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[20px] border border-dashed border-ink-900/15 bg-white p-6 text-ink-500">
      <MapPinIcon className="h-6 w-6 text-ink-500" />
      <p className="text-[14px] font-bold text-ink-900">{heading}</p>
      <p className="text-[13px] font-medium">
        Mapbox token সেট হয়নি। <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[12px]">.env.local</code>{" "}
        ফাইলে <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[12px]">NEXT_PUBLIC_MAPBOX_TOKEN</code> যোগ করুন।
      </p>
    </div>
  );
}
