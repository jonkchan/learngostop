import type { Metadata } from "next";
import { Inter, Noto_Serif_KR } from "next/font/google";
import { siteDescription, siteKeywords, siteName, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  category: "games",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSerifKr.variable} antialiased`}>
      <body className="bg-[#8a8178] font-sans text-[8.6pt] leading-[1.38] text-ink print:bg-transparent">
        {children}
      </body>
    </html>
  );
}
