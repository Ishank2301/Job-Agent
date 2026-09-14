import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { THEME_SCRIPT, ThemeProvider } from "@/components/theme/ThemeProvider";
import { site } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — AI job applications with human-in-the-loop control`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} min-h-screen bg-bg font-sans text-ink antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <SessionProvider>
          <ThemeProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
