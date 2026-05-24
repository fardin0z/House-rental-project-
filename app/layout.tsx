import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeModalTrigger } from "@/components/pwa/welcome-modal-trigger";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ToletZoo — বাসা ভাড়ার নতুন ঠিকানা",
  description: "যাচাইকৃত মালিকের কাছ থেকে দালাল ছাড়াই বাসা ভাড়া।",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ToletZoo",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2EDE3" },
    { media: "(prefers-color-scheme: dark)", color: "#1F1812" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${hindSiliguri.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
          <WelcomeModalTrigger />
          <RegisterServiceWorker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
