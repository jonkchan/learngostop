import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { siteDescription, siteKeywords, siteName, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Noto Serif KR cut down to the characters the site uses (see scripts/subset-font.py): ~60 KB instead of
// the ~620 KB of Google Fonts slices the page used to pull. Re-run the script after adding new Korean text.
const notoSerifKr = localFont({
  src: "./fonts/NotoSerifKR-subset.woff2",
  variable: "--font-noto-serif-kr",
  weight: "200 900",
});

// Fit the letter-size sheets to a phone before the first paint, so the page doesn't jump once JS loads.
// Same math as <FitToScreen>, which takes over for resizes and rotation.
const fitBeforePaint = `try{var w=Math.min(document.documentElement.clientWidth,screen.width);document.documentElement.style.setProperty("--sheet-zoom",String(Math.min(1,w/${8.9 * 96})))}catch(e){}`;

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
    // suppressHydrationWarning: fitBeforePaint sets a style on <html> before React hydrates
    <html lang="en" className={`${inter.variable} ${notoSerifKr.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans text-[8.6pt] leading-[1.38] text-ink print:bg-transparent">
        <script dangerouslySetInnerHTML={{ __html: fitBeforePaint }} />
        {children}
      </body>
    </html>
  );
}
