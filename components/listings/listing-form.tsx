"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  PencilIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateListingAction,
  deleteListingAction,
  withdrawListingToDraftAction,
} from "@/lib/listings/actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { ActionState } from "@/lib/auth/actions";
import type { ListingRow, RentalType } from "@/types/database.types";

const RENTAL_TYPES: RentalType[] = [
  "family_flat",
  "bachelor",
  "sublet",
  "shop",
  "office",
];

const initial: ActionState = {};

export function ListingForm({
  listing,
  imageCount,
}: {
  listing: ListingRow;
  imageCount: number;
}) {
  const t = useTranslations("listings");
  const tForm = useTranslations("listings.form");

  const boundUpdate = updateListingAction.bind(null, listing.id);
  const [state, formAction, saving] = useActionState(boundUpdate, initial);
  const lastOk = useRef(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) {
      lastOk.current = true;
      toast.success(t("saved"));
    }
    if (!state.ok) lastOk.current = false;
  }, [state.ok, t]);

  async function handleWithdraw() {
    try {
      await withdrawListingToDraftAction(listing.id);
      toast.success(t("nowEditable"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    }
  }

  async function handleDelete() {
    try {
      await deleteListingAction(listing.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "মুছতে সমস্যা");
    }
  }

  const readonly = listing.status === "pending" || listing.status === "approved";

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {readonly ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-ember/30 bg-ember-soft/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-clay">
            {listing.status === "approved"
              ? tForm("readonlyApproved")
              : tForm("readonlyPending")}
          </p>
          <button
            type="button"
            onClick={() => setEditConfirmOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition-transform hover:scale-[1.02]"
          >
            <PencilIcon className="size-3.5" />
            <span>{t("editAgain")}</span>
          </button>
        </div>
      ) : null}

      <Field label={tForm("title")} error={state.fieldErrors?.title}>
        <Input
          name="title"
          defaultValue={listing.title}
          placeholder={tForm("titlePlaceholder")}
          maxLength={120}
          disabled={readonly}
          className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
        />
      </Field>

      <Field
        label={tForm("description")}
        hint={tForm("descriptionHint")}
        error={state.fieldErrors?.description}
      >
        <textarea
          name="description"
          defaultValue={listing.description ?? ""}
          placeholder={tForm("descriptionPlaceholder")}
          maxLength={2000}
          rows={5}
          disabled={readonly}
          className="rounded-2xl border border-rule bg-paper px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ember/40"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={tForm("rentalType")} error={state.fieldErrors?.rental_type}>
          <select
            name="rental_type"
            defaultValue={listing.rental_type}
            disabled={readonly}
            className="h-12 rounded-2xl border border-rule bg-paper px-4 text-base outline-none focus:ring-2 focus:ring-ember/40"
          >
            {RENTAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {tForm(`rentalTypes.${type}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={tForm("rent")} error={state.fieldErrors?.rent}>
          <Input
            name="rent"
            type="number"
            inputMode="numeric"
            defaultValue={listing.rent || ""}
            placeholder="১৫০০০"
            min={500}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={tForm("beds")} error={state.fieldErrors?.beds}>
          <Input
            name="beds"
            type="number"
            inputMode="numeric"
            defaultValue={listing.beds ?? ""}
            min={0}
            max={20}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
        <Field label={tForm("baths")} error={state.fieldErrors?.baths}>
          <Input
            name="baths"
            type="number"
            inputMode="numeric"
            defaultValue={listing.baths ?? ""}
            min={0}
            max={20}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={tForm("areaName")} error={state.fieldErrors?.area_name}>
          <Input
            name="area_name"
            defaultValue={listing.area_name}
            placeholder={tForm("areaPlaceholder")}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
        <Field label={tForm("district")} error={state.fieldErrors?.district}>
          <Input
            name="district"
            defaultValue={listing.district ?? ""}
            placeholder={tForm("districtPlaceholder")}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
        <Field label={tForm("division")} error={state.fieldErrors?.division}>
          <Input
            name="division"
            defaultValue={listing.division ?? ""}
            placeholder={tForm("divisionPlaceholder")}
            disabled={readonly}
            className="h-12 rounded-2xl border-rule bg-paper px-4 text-base"
          />
        </Field>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-rule/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={readonly}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          <Trash2Icon className="size-4" />
          <span>{tForm("delete")}</span>
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={readonly || saving}
            className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            <span className="inline-flex size-4 items-center justify-center">
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
            </span>
            <span>{tForm("save")}</span>
          </button>

          {listing.status === "draft" || listing.status === "rejected" ? (
            <button
              type="submit"
              name="intent"
              value="submit"
              disabled={saving || imageCount === 0}
              onClick={(event) => {
                if (imageCount === 0) {
                  event.preventDefault();
                  toast.warning(t("needImages"));
                }
              }}
              className="group inline-flex items-center justify-between gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              title={imageCount === 0 ? t("needImages") : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <SendIcon className="size-4" />
                {tForm("submitForReview")}
              </span>
              <span className="grid size-7 place-items-center rounded-full bg-ember transition-transform group-hover:rotate-12">
                <ArrowUpRightIcon className="size-3.5" />
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={editConfirmOpen}
        onOpenChange={setEditConfirmOpen}
        icon={<PencilIcon className="size-6" />}
        title={t("editConfirmTitle")}
        description={t("editConfirmBody")}
        confirmLabel={t("editConfirmYes")}
        cancelLabel={t("editConfirmNo")}
        onConfirm={handleWithdraw}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        variant="destructive"
        icon={<Trash2Icon className="size-6" />}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmBody")}
        confirmLabel={t("deleteConfirmYes")}
        cancelLabel={t("editConfirmNo")}
        onConfirm={handleDelete}
      />
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Label className="text-[0.95rem] font-medium leading-relaxed text-ink-soft">
          {label}
        </Label>
        {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
