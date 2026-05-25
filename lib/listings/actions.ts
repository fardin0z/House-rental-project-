"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { rentalTypeSchema } from "./schema";
import { parseBengaliInt } from "@/lib/utils/bengali-number";
import type { ActionState } from "@/lib/auth/actions";

function readListingForm(formData: FormData) {
  const rentalTypeRaw = formData.get("rental_type");
  const rentalType = rentalTypeSchema.safeParse(rentalTypeRaw);

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    rental_type: rentalType.success ? rentalType.data : "family_flat",
    rent: parseBengaliInt(formData.get("rent")),
    beds: parseBengaliInt(formData.get("beds")),
    baths: parseBengaliInt(formData.get("baths")),
    area_sqft: parseBengaliInt(formData.get("area_sqft")),
    area_name: String(formData.get("area_name") ?? "").trim(),
    division: String(formData.get("division") ?? "").trim(),
    district: String(formData.get("district") ?? "").trim(),
  };
}

function validateForSubmit(v: ReturnType<typeof readListingForm>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (v.title.length < 4) errors.title = "শিরোনাম কমপক্ষে ৪ অক্ষরের হতে হবে";
  if (!v.rent || v.rent < 500) errors.rent = "ভাড়া কমপক্ষে ৫০০ টাকা দিন";
  if (v.area_name.length < 2) errors.area_name = "এলাকার নাম দিন";
  return errors;
}

export async function createDraftListingAction() {
  const profile = await requireProfile();

  if (profile.role !== "landlord") {
    redirect("/listings");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({ owner_id: profile.id })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "ড্রাফট তৈরিতে সমস্যা");
  }

  redirect(`/listings/${data.id}/edit`);
}

export async function updateListingAction(
  listingId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const intent = formData.get("intent");
  const v = readListingForm(formData);

  if (intent === "submit") {
    const errors = validateForSubmit(v);
    if (Object.keys(errors).length > 0) {
      return { fieldErrors: errors };
    }
  }

  const supabase = await getSupabaseServerClient();
  const { error: updateError } = await supabase
    .from("listings")
    .update({
      title: v.title,
      description: v.description ? v.description : null,
      rental_type: v.rental_type,
      rent: v.rent ?? 0,
      beds: v.beds,
      baths: v.baths,
      area_sqft: v.area_sqft,
      area_name: v.area_name,
      division: v.division ? v.division : null,
      district: v.district ? v.district : null,
    })
    .eq("id", listingId)
    .eq("owner_id", profile.id);

  if (updateError) {
    console.error("[updateListing]", updateError);
    return { error: "সংরক্ষণ করা যায়নি। একটু পর আবার চেষ্টা করুন।" };
  }

  if (intent === "submit") {
    const { count } = await supabase
      .from("listing_images")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId);

    if (!count || count === 0) {
      return { error: "কমপক্ষে ১টি ছবি যোগ করুন" };
    }

    const { error: statusError } = await supabase
      .from("listings")
      .update({ status: "pending" })
      .eq("id", listingId)
      .eq("owner_id", profile.id);

    if (statusError) {
      console.error("[submitListing]", statusError);
      return { error: "জমা দেওয়া যায়নি। একটু পর আবার চেষ্টা করুন।" };
    }

    revalidatePath("/listings");
    redirect("/listings");
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/listings/${listingId}/edit`);
  revalidatePath("/listings");
  return { ok: true };
}

export async function attachListingImageAction(
  listingId: string,
  path: string,
  sortOrder: number,
): Promise<{ id: string }> {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("listing_images")
    .insert({ listing_id: listingId, path, sort_order: sortOrder })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[attachListingImage]", error);
    throw new Error("ছবি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
  }

  void profile;
  revalidatePath(`/listings/${listingId}/edit`);
  return { id: data.id };
}

export async function removeListingImageAction(
  listingId: string,
  imageId: string,
): Promise<void> {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { data: image } = await supabase
    .from("listing_images")
    .select("path, listing_id, listings(owner_id)")
    .eq("id", imageId)
    .maybeSingle();

  if (!image || image.listing_id !== listingId) {
    throw new Error("ছবি পাওয়া যায়নি");
  }

  const { error: deleteError } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    console.error("[removeListingImage]", deleteError);
    throw new Error("ছবি মুছে ফেলা যায়নি। আবার চেষ্টা করুন।");
  }

  await supabase.storage.from("listing-images").remove([image.path]);

  void profile;
  revalidatePath(`/listings/${listingId}/edit`);
}

export async function attachListingVideoAction(listingId: string, path: string) {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("listings")
    .select("video_path")
    .eq("id", listingId)
    .eq("owner_id", profile.id)
    .maybeSingle();

  const { error } = await supabase
    .from("listings")
    .update({ video_path: path })
    .eq("id", listingId)
    .eq("owner_id", profile.id);

  if (error) {
    console.error("[attachListingVideo]", error);
    throw new Error("ভিডিও সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
  }

  if (existing?.video_path && existing.video_path !== path) {
    await supabase.storage.from("listing-images").remove([existing.video_path]);
  }

  revalidatePath(`/listings/${listingId}/edit`);
}

export async function removeListingVideoAction(listingId: string) {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("listings")
    .select("video_path")
    .eq("id", listingId)
    .eq("owner_id", profile.id)
    .maybeSingle();

  const { error } = await supabase
    .from("listings")
    .update({ video_path: null })
    .eq("id", listingId)
    .eq("owner_id", profile.id);

  if (error) {
    console.error("[removeListingVideo]", error);
    throw new Error("ভিডিও মুছে ফেলা যায়নি। আবার চেষ্টা করুন।");
  }

  if (existing?.video_path) {
    await supabase.storage.from("listing-images").remove([existing.video_path]);
  }

  revalidatePath(`/listings/${listingId}/edit`);
}

export async function withdrawListingToDraftAction(listingId: string) {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("listings")
    .update({ status: "draft" })
    .eq("id", listingId)
    .eq("owner_id", profile.id)
    .in("status", ["pending", "approved", "rejected"]);

  if (error) {
    console.error("[withdrawListing]", error);
    throw new Error("সম্পাদনা শুরু করা যায়নি। আবার চেষ্টা করুন।");
  }

  revalidatePath(`/listings/${listingId}/edit`);
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/listings");
}

export async function deleteListingAction(listingId: string) {
  const profile = await requireProfile();
  const supabase = await getSupabaseServerClient();

  const { data: images } = await supabase
    .from("listing_images")
    .select("path")
    .eq("listing_id", listingId);

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("owner_id", profile.id);

  if (error) {
    console.error("[deleteListing]", error);
    throw new Error("বিজ্ঞাপন মুছে ফেলা যায়নি। আবার চেষ্টা করুন।");
  }

  if (images && images.length > 0) {
    await supabase.storage
      .from("listing-images")
      .remove(images.map((i) => i.path));
  }

  revalidatePath("/listings");
  redirect("/listings");
}
