"use client";

import {
  useActionState,
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpRightIcon,
  CameraIcon,
  CheckCircle2Icon,
  ImageIcon,
  Loader2Icon,
} from "lucide-react";
import { compressAndUploadNidImage } from "@/lib/storage/upload";
import type { NidImageType } from "@/lib/storage/paths";
import { submitNidAction } from "@/lib/auth/onboarding-actions";
import type { ActionState } from "@/lib/auth/actions";
import type { IdDocumentType } from "@/types/database.types";
import { cn } from "@/lib/utils";

type UploadState = {
  preview?: string;
  path?: string;
  uploading?: boolean;
  error?: string;
};

const DOCUMENT_TYPES: IdDocumentType[] = [
  "nid",
  "birth_certificate",
  "passport",
  "driving_license",
  "student_id",
  "other",
];

const initial: ActionState = {};

export function NidUploadForm({ userId }: { userId: string }) {
  const t = useTranslations("auth");
  const [submitState, formAction, submitting] = useActionState(submitNidAction, initial);
  const [, startTransition] = useTransition();

  const [documentType, setDocumentType] = useState<IdDocumentType>("nid");
  const [front, setFront] = useState<UploadState>({});
  const [back, setBack] = useState<UploadState>({});
  const [selfie, setSelfie] = useState<UploadState>({});

  const allUploaded = Boolean(front.path && back.path && selfie.path);
  const anyUploading = front.uploading || back.uploading || selfie.uploading;

  const slots: {
    key: NidImageType;
    label: string;
    icon: typeof CameraIcon;
    state: UploadState;
    setState: (next: UploadState) => void;
  }[] = [
    { key: "front", label: t("nidFront"), icon: ImageIcon, state: front, setState: setFront },
    { key: "back", label: t("nidBack"), icon: ImageIcon, state: back, setState: setBack },
    { key: "selfie", label: t("nidSelfie"), icon: CameraIcon, state: selfie, setState: setSelfie },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="documentType" value={documentType} />
      <input type="hidden" name="frontPath" value={front.path ?? ""} />
      <input type="hidden" name="backPath" value={back.path ?? ""} />
      <input type="hidden" name="selfiePath" value={selfie.path ?? ""} />

      <div className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("documentTypeLabel")}
        </span>
        <select
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value as IdDocumentType)}
          className="h-12 rounded-2xl border border-rule bg-paper px-4 text-base outline-none focus:ring-2 focus:ring-ember/40"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`documentTypes.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-ember/30 bg-ember-soft/40 px-4 py-3">
        <CameraIcon className="mt-0.5 size-4 shrink-0 text-clay" />
        <p className="text-xs leading-relaxed text-clay">{t("uploadHint")}</p>
      </div>

      <div className="grid gap-3">
        {slots.map((slot) => (
          <UploadSlot
            key={slot.key}
            type={slot.key}
            label={slot.label}
            icon={slot.icon}
            state={slot.state}
            userId={userId}
            doneLabel={t("uploadDone")}
            pickLabel={t("uploadPick")}
            onChange={(next) => startTransition(() => slot.setState(next))}
          />
        ))}
      </div>

      {submitState.error ? (
        <p className="text-sm text-destructive">{submitState.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={!allUploaded || anyUploading || submitting}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{submitting ? "..." : t("submitNid")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>
    </form>
  );
}

function UploadSlot({
  type,
  label,
  icon: Icon,
  state,
  userId,
  doneLabel,
  pickLabel,
  onChange,
}: {
  type: NidImageType;
  label: string;
  icon: typeof CameraIcon;
  state: UploadState;
  userId: string;
  doneLabel: string;
  pickLabel: string;
  onChange: (next: UploadState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback(
    async (file: File) => {
      const preview = URL.createObjectURL(file);
      onChange({ preview, uploading: true });
      try {
        const path = await compressAndUploadNidImage(file, userId, type);
        onChange({ preview, path, uploading: false });
      } catch (error) {
        onChange({
          preview,
          uploading: false,
          error: error instanceof Error ? error.message : "আপলোড ব্যর্থ",
        });
      }
    },
    [onChange, type, userId],
  );

  const done = Boolean(state.path);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-paper p-3 pr-5 text-left transition-all",
        done
          ? "border-ink/30"
          : "border-dashed border-rule hover:border-ink/40 hover:bg-canvas-deep/40",
      )}
    >
      {state.preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.preview}
          alt=""
          className="size-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-canvas-deep text-ink-soft">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {label}
        </span>
        <span className="font-display text-lg italic leading-tight text-ink">
          {done ? doneLabel : pickLabel}
        </span>
        {state.error ? (
          <span className="text-xs text-destructive">{state.error}</span>
        ) : null}
      </div>
      <div className="shrink-0">
        {state.uploading ? (
          <Loader2Icon className="size-5 animate-spin text-ink-soft" />
        ) : done ? (
          <CheckCircle2Icon className="size-6 fill-ember text-paper" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full border border-rule text-ink-soft transition-colors group-hover:border-ink group-hover:text-ink">
            <ArrowUpRightIcon className="size-4" />
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={type === "selfie" ? "user" : "environment"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </button>
  );
}
