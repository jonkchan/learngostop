import { CardsPage } from "@/components/CardsPage";
import { FitToScreen } from "@/components/FitToScreen";
import { FloatingActions } from "@/components/FloatingActions";
import { HighlightProvider } from "@/components/Highlight";
import { RulesPage } from "@/components/RulesPage";
import { SpeakKorean } from "@/components/SpeakKorean";
import { WelcomeTour } from "@/components/WelcomeTour";
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";

// Structured data so search engines understand the page is a guide to the game Go-Stop.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: siteTitle,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
  about: {
    "@type": "Game",
    name: "Go-Stop",
    alternateName: ["고스톱", "Gostop", "Go Stop", "Matgo", "맞고"],
    description:
      "A Korean fishing card game played with a 48-card hwatu (화투) flower-card deck, where players capture cards by month and decide to Go or Stop once they reach the target score.",
    numberOfPlayers: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3 },
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* shared so the page 1 legend and the page 2 scoring table can both highlight cards */}
      <HighlightProvider>
        <CardsPage />
        <RulesPage />
      </HighlightProvider>
      <FloatingActions />
      <FitToScreen />
      <WelcomeTour />
      <SpeakKorean />
    </main>
  );
}
