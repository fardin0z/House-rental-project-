"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();

export async function approveNidAction(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();

  const { data: doc, error: docErr } = await supabase
    .from("nid_documents")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  if (docErr || !doc) throw new Error("not found");

  const reviewedAt = new Date().toISOString();

  const { error: updErr } = await supabase
    .from("nid_documents")
    .update({
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: reviewedAt,
      rejection_reason: null,
    })
    .eq("id", id);
  if (updErr) throw new Error(updErr.message);

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ nid_status: "approved" })
    .eq("id", doc.user_id);
  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/admin/nid-approvals");
  revalidatePath("/admin");
}

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function rejectNidAction(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");
  const parsed = rejectSchema.parse({
    id: formData.get("id"),
    reason: formData.get("reason") ?? undefined,
  });
  const supabase = getSupabaseAdminClient();

  const { data: doc, error: docErr } = await supabase
    .from("nid_documents")
    .select("user_id")
    .eq("id", parsed.id)
    .maybeSingle();
  if (docErr || !doc) throw new Error("not found");

  const reviewedAt = new Date().toISOString();

  const { error: updErr } = await supabase
    .from("nid_documents")
    .update({
      status: "rejected",
      reviewed_by: admin.id,
      reviewed_at: reviewedAt,
      rejection_reason: parsed.reason || null,
    })
    .eq("id", parsed.id);
  if (updErr) throw new Error(updErr.message);

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ nid_status: "rejected" })
    .eq("id", doc.user_id);
  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/admin/nid-approvals");
  revalidatePath("/admin");
}

export async function suspendUserAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function unsuspendUserAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  if (id === admin.id) throw new Error("cannot delete self");

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

const setRoleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["tenant", "landlord", "admin"]),
});

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");
  const parsed = setRoleSchema.parse({
    id: formData.get("id"),
    role: formData.get("role"),
  });
  if (parsed.id === admin.id && parsed.role !== "admin") {
    throw new Error("cannot demote self");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.role })
    .eq("id", parsed.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

const createUserSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z
      .string()
      .trim()
      .email()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{8,15}$/)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    password: z.string().min(8).max(72),
    role: z.enum(["tenant", "landlord", "admin"]),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "email or phone required",
    path: ["email"],
  });

export type CreateUserState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  redirectTo?: string;
};

export async function createUserAction(
  _state: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireRole("admin");
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    phone: parsed.data.phone,
    password: parsed.data.password,
    email_confirm: Boolean(parsed.data.email),
    phone_confirm: Boolean(parsed.data.phone),
    user_metadata: { name: parsed.data.name },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "failed to create user" };
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role, name: parsed.data.name })
    .eq("id", data.user.id);
  if (profileErr) {
    return { error: profileErr.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, redirectTo: "/admin/users" };
}

export async function approveListingAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

const rejectListingSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

export async function rejectListingAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const parsed = rejectListingSchema.parse({
    id: formData.get("id"),
    reason: formData.get("reason") ?? undefined,
  });
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({
      status: "rejected",
      rejection_reason: parsed.reason || null,
    })
    .eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

export async function archiveListingAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("listings")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/listings");
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

const movingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed"]),
});

export async function updateMovingStatusAction(
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const parsed = movingStatusSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("moving_requests")
    .update({ status: parsed.status })
    .eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moving-requests");
  revalidatePath("/admin");
}

const movingNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(2000).optional(),
});

export async function updateMovingNotesAction(
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const parsed = movingNotesSchema.parse({
    id: formData.get("id"),
    notes: formData.get("notes") ?? undefined,
  });
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("moving_requests")
    .update({ internal_notes: parsed.notes || null })
    .eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moving-requests");
}

export async function deleteMovingRequestAction(
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const id = idSchema.parse(formData.get("id"));
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("moving_requests")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moving-requests");
  revalidatePath("/admin");
}
