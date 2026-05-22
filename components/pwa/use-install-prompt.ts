"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallStatus = "available" | "installed" | "unavailable";

export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<InstallStatus>("unavailable");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setStatus("installed");
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setStatus("available");
    };

    const onInstalled = () => {
      setEvent(null);
      setStatus("installed");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function prompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!event) return "unavailable";
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      setEvent(null);
      setStatus("installed");
    }
    return choice.outcome;
  }

  return { status, prompt };
}
