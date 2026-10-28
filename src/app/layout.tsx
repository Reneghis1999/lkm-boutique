import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { shop } from "@/data/shop";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${shop.name} — Tech & Gaming à Lomé`,
    template: `%s | ${shop.name}`,
  },
  description: shop.description,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/logo-lkm.png", type: "image/png" }],
    shortcut: "/logo-lkm.png",
    apple: "/logo-lkm.png",
  },
  openGraph: {
    title: shop.name,
    description: shop.tagline,
    locale: "fr_TG",
    type: "website",
    url: siteUrl,
    siteName: shop.name,
    images: [{ url: "/logo-lkm.png", width: 512, height: 512, alt: shop.name }],
  },
  twitter: {
    card: "summary",
    title: shop.name,
    description: shop.tagline,
    images: ["/logo-lkm.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[var(--lkm-bg)] text-[var(--foreground)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
