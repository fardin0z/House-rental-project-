"use client";

import Link from "next/link";
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
  CheckIcon,
  IdCardIcon,
  ImageUpIcon,
  Loader2Icon,
} from "lucide-react";
import { compressAndUploadNidImage } from "@/lib/storage/upload";
import type { NidImageType } from "@/lib/storage/paths";
import { submitNidAction } from "@/lib/auth/onboarding-actions";
import type { ActionState } from "@/lib/auth/actions";
import type { IdDocumentType } from "@/types/database.types";

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

  const slots: { key: NidImageType; label: string; state: UploadState; setState: (s: UploadState) => void }[] = [
    { key: "front", label: t("nidFront"), state: front, setState: setFront },
    { key: "back", label: t("nidBack"), state: back, setState: setBack },
    { key: "selfie", label: t("nidSelfie"), state: selfie, setState: setSelfie },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="documentType" value={documentType} />
      <input type="hidden" name="frontPath" value={front.path ?? ""} />
      <input type="hidden" name="backPath" value={back.path ?? ""} />
      <input type="hidden" name="selfiePath" value={selfie.path ?? ""} />

      <label className="input-card block rounded-[18px] bg-white p-4">
        <span className="block text-[12px] font-bold text-ink-500">
          {t("documentTypeLabel")}
        </span>
        <div className="mt-3 flex items-center gap-3">
          <IdCardIcon className="h-5 w-5 text-ink-500/40" />
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as IdDocumentType)}
            className="w-full appearance-none border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`documentTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {slots.map((slot) => (
          <UploadSlot
            key={slot.key}
            type={slot.key}
            label={slot.label}
            state={slot.state}
            userId={userId}
            doneLabel={t("uploadDone")}
            pickLabel={t("uploadPick")}
            onChange={(next) => startTransition(() => slot.setState(next))}
          />
        ))}
      </div>

      <p className="rounded-[18px] bg-white px-4 py-3 text-[13px] font-medium leading-relaxed text-ink-500">
        {t("uploadHint")}
      </p>

      <p className="min-h-5 text-[13px] font-semibold leading-5 text-red-600">
        {submitState.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={!allUploaded || anyUploading || submitting}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "..." : t("submitNid")}
        <ArrowUpRightIcon className="ml-2 h-5 w-5" />
      </button>

      <div className="border-t border-ink-100 pt-4">
        <p className="text-center text-[13px] font-medium leading-relaxed text-ink-500">
          {t("skipHint")}
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-900 text-[14px] font-bold text-white transition hover:bg-ink-700"
        >
          {t("skipForNow")}
        </Link>
      </div>
    </form>
  );
}

function UploadSlot({
  type,
  label,
  state,
  userId,
  doneLabel,
  pickLabel,
  onChange,
}: {
  type: NidImageType;
  label: string;
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
  const uploading = Boolean(state.uploading);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={
        done
          ? "relative cursor-pointer overflow-hidden rounded-[20px] bg-ink-900 p-4 text-left text-white transition"
          : "relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-4 text-left text-ink-900 transition hover:bg-white/80"
      }
    >
      <div className="flex min-h-[160px] flex-col justify-between pr-8">
        <div>
          <span
            className={
              done
                ? "inline-flex h-11 w-11 items-center justify-center rounded-full bg-lime-400 text-ink-900"
                : "inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-900"
            }
          >
            {done ? (
              <CheckIcon className="h-5 w-5" />
            ) : uploading ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <ImageUpIcon className="h-5 w-5" />
            )}
          </span>
          <h3 className="mt-4 text-[17px] font-semibold leading-tight tracking-tight">
            {label}
          </h3>
          {done ? (
            <p className="mt-2 text-[12px] font-semibold text-white/65">
              {doneLabel}
            </p>
          ) : null}
        </div>

        <div>
          {uploading ? (
            <>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full w-2/3 rounded-full bg-lime-400" />
              </div>
              <p className="mt-3 text-[13px] font-bold text-ink-500">
                আপলোড হচ্ছে...
              </p>
            </>
          ) : done ? (
            <p className="text-[13px] font-bold text-white/65">
              ছবি পরিবর্তন করুন
            </p>
          ) : (
            <p className="text-[13px] font-bold text-lime-600">{pickLabel}</p>
          )}
          {state.error ? (
            <p className="mt-2 text-[12px] font-bold text-red-600">
              {state.error}
            </p>
          ) : null}
        </div>
      </div>

      {done && state.preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.preview}
          alt=""
          className="absolute bottom-3 right-3 z-[6] h-16 w-16 rounded-full border-4 border-lime-400 object-cover"
        />
      ) : null}

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
