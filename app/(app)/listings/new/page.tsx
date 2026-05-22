import { createDraftListingAction } from "@/lib/listings/actions";

export default async function NewListingPage() {
  await createDraftListingAction();
  return null;
}
