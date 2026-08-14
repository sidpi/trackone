import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://track.sidcandev.online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShipTrack — Shipment tracking, simplified",
    template: "%s · ShipTrack",
  },
  description:
    "ShipTrack is a shipment tracking app for small freight teams. Every shipment in one dashboard, tracked through courier providers.",
  manifest: "/manifest.webmanifest",
  icons: {
    // app/icon.svg is auto-linked as the favicon; the manifest supplies the
    // installable app icon (PNG) for phones/desktops.
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "ShipTrack",
    title: "ShipTrack — Shipment tracking, simplified",
    description:
      "ShipTrack is a shipment tracking app for small freight teams. Every shipment in one dashboard, tracked through courier providers.",
    url: SITE_URL,
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "ShipTrack logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ShipTrack — Shipment tracking, simplified",
    description:
      "ShipTrack is a shipment tracking app for small freight teams. Every shipment in one dashboard, tracked through courier providers.",
    images: ["/logo-512.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
