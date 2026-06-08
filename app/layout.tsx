import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeModalTrigger } from "@/components/pwa/welcome-modal-trigger";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import {
  SITE_NAME,
  SITE_TAGLINE_BN,
  SITE_TAGLINE_EN,
  getSiteUrl,
} from "@/lib/seo/site";
import "./globals.css";

const siteUrl = getSiteUrl();

const hindSiliguri = Hind_Siliguri({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — বাসা ভাড়ার নতুন ঠিকানা`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_TAGLINE_BN,
  applicationName: SITE_NAME,
  keywords: [
    "ToletZoo",
    "বাসা ভাড়া",
    "house rent bangladesh",
    "tolet dhaka",
    "flat for rent dhaka",
    "rent house bangladesh",
    "bachelor mess",
    "family flat dhaka",
    "sublet dhaka",
    "verified landlord bangladesh",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — বাসা ভাড়ার নতুন ঠিকানা`,
    description: SITE_TAGLINE_EN,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — বাসা ভাড়ার নতুন ঠিকানা`,
    description: SITE_TAGLINE_EN,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "real estate",
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
      className={`${hindSiliguri.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} h-full antialiased`}
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
