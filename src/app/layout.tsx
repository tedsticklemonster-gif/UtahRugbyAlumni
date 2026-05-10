import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { InstallPrompt } from "@/components/install-prompt";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "University of Utah Rugby Alumni Network",
    template: "%s — U of U Rugby Alumni",
  },
  description:
    "The private directory for University of Utah Rugby alumni and current players. Find teammates, see the schedule, and stay connected.",
  applicationName: "UU Rugby Alumni",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "UU Rugby",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "University of Utah Rugby Alumni Network",
    description:
      "The private directory for University of Utah Rugby alumni and current players.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} dark h-full antialiased`}
    >
      <head>
        <style>{`@view-transition { navigation: auto; }`}</style>
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
        <InstallPrompt />
      </body>
    </html>
  );
}
