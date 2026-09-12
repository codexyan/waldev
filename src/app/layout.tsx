import type { Metadata } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SITE } from "@/lib/constants";

// Font di-download saat build & disajikan self-hosted (tanpa request ke Google
// saat runtime); next/font menyetel fallback metrics sehingga CLS tetap 0.
//
// Satu wajah huruf saja untuk teks maupun judul. Grotesk yang agak rapat ini
// tetap tenang pada 14px dan cukup tegas pada judul 48px, sehingga tidak perlu
// wajah display terpisah — sekaligus memangkas satu unduhan font.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

// Monospace hanya untuk potongan perintah dan kode.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  keywords: [
    "WalDev",
    "portofolio aplikasi",
    "aplikasi web",
    "catatan pembuatan aplikasi",
    "web developer Banjarmasin",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${archivo.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
