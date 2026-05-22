import { getCurrentProfile } from "@/lib/auth/guards";
import { WelcomeModal } from "@/components/pwa/welcome-modal";

export async function WelcomeModalTrigger() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (profile.welcome_seen_at) return null;

  return <WelcomeModal userName={profile.name} />;
}
