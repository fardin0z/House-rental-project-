import { CheckIcon, MapPinIcon, ShieldCheckIcon, StarIcon } from "lucide-react";

const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80&auto=format&fit=crop";
const OTP_IMAGE =
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1400&q=80&auto=format&fit=crop";
const ROLE_IMAGE =
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=80&auto=format&fit=crop";
const NID_IMAGE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80&auto=format&fit=crop";

type Pill = { icon: React.ReactNode; label: string };

function AsideFrame({
  src,
  pills,
  caption,
  tag,
  meta,
}: {
  src: string;
  pills?: Pill[];
  caption?: string;
  tag?: string;
  meta?: { label: string; value: string };
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-tr from-ink/65 via-ink/15 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-ink/40" />

      {tag ? (
        <div className="absolute left-6 top-6 z-10">
          <span className="glass-pill">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute size-2 animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
            {tag}
          </span>
        </div>
      ) : null}

      {pills ? (
        <div className="absolute right-6 top-20 z-10 flex flex-col items-end gap-2">
          {pills.map((pill, index) => (
            <span
              key={pill.label}
              className="glass-pill"
              style={{ transform: `translateX(${index * -6}px)` }}
            >
              {pill.icon}
              {pill.label}
            </span>
          ))}
        </div>
      ) : null}

      {caption ? (
        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-4">
          <p className="max-w-xs text-sm leading-relaxed text-paper/90">
            <span className="font-display italic text-ember">"</span>
            {caption}
            <span className="font-display italic text-ember">"</span>
          </p>
          {meta ? (
            <div className="shrink-0 rounded-2xl border border-paper/15 bg-ink/30 p-3 backdrop-blur-md text-right">
              <div className="font-display text-3xl italic leading-none text-paper">
                {meta.value}
              </div>
              <div className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-paper/70">
                {meta.label}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export function LoginAside({ tag, caption, meta }: { tag: string; caption: string; meta: { label: string; value: string } }) {
  return (
    <AsideFrame
      src={LOGIN_IMAGE}
      tag={tag}
      caption={caption}
      meta={meta}
      pills={[
        { icon: <ShieldCheckIcon className="size-3" />, label: "NID যাচাইকৃত" },
        { icon: <MapPinIcon className="size-3" />, label: "ঢাকা" },
        { icon: <StarIcon className="size-3" />, label: "৪.৯" },
      ]}
    />
  );
}

export function OtpAside({ tag, caption, meta }: { tag: string; caption: string; meta: { label: string; value: string } }) {
  return (
    <AsideFrame
      src={OTP_IMAGE}
      tag={tag}
      caption={caption}
      meta={meta}
      pills={[
        { icon: <CheckIcon className="size-3" />, label: "এনক্রিপ্টেড" },
        { icon: <ShieldCheckIcon className="size-3" />, label: "নিরাপদ" },
      ]}
    />
  );
}

export function RoleAside({ tag, caption, meta }: { tag: string; caption: string; meta: { label: string; value: string } }) {
  return (
    <AsideFrame
      src={ROLE_IMAGE}
      tag={tag}
      caption={caption}
      meta={meta}
      pills={[
        { icon: <MapPinIcon className="size-3" />, label: "চট্টগ্রাম" },
        { icon: <StarIcon className="size-3" />, label: "প্রিমিয়াম" },
      ]}
    />
  );
}

export function NidAside({ tag, caption, meta }: { tag: string; caption: string; meta: { label: string; value: string } }) {
  return (
    <AsideFrame
      src={NID_IMAGE}
      tag={tag}
      caption={caption}
      meta={meta}
      pills={[
        { icon: <ShieldCheckIcon className="size-3" />, label: "যাচাই চলছে" },
      ]}
    />
  );
}
