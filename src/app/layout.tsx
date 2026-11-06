import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { BusinessJsonLd } from "@/components/seo/business-json-ld";
import { shop } from "@/data/shop";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Mêmes polices que reinvent-labs.com (Google Fonts, licence libre OFL).
// Polices « variables » : un seul fichier couvre toutes les graisses.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  preload: false, // peu utilisée (blocs <code>) : chargée seulement si besoin
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable} h-full`}>
      <head>
        {/* Site en anglais : on masque la page le temps de la traduire (1,5 s max). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(/(?:^|;\\s*)lkm_lang=en\\b/.test(document.cookie)&&!location.pathname.startsWith('/admin')){var d=document.documentElement;d.classList.add('i18n-pending');d.lang='en';setTimeout(function(){d.classList.remove('i18n-pending')},1600)}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--lkm-bg)] text-[var(--foreground)] antialiased">
        <BusinessJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
