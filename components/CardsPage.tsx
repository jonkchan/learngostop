import { months } from "@/lib/deck";
import { MiniCard } from "./HwatuCard";
import { siteUrl } from "@/lib/site";
import { MonthBlock } from "./MonthBlock";
import { QrCode } from "./QrCode";
import { Ko, SectionTitle, Sheet } from "./Sheet";

const types = [
  { n: 5, t: "Gwang 광", d: "“Bright” cards. Rare and valuable, marked 光.", cls: "bg-gold-soft border-gold" },
  { n: 9, t: "Animal 열끗", d: "Birds, beasts & objects. Also called yeol (10s).", cls: "bg-tan border-rule" },
  { n: 10, t: "Ribbon 띠", d: "Poem slips (tti). Red, blue, or plain.", cls: "bg-hred-soft border-[#e7b9b4]" },
  { n: 24, t: "Junk 피", d: "Pi: plain flower cards. Two of them count double.", cls: "bg-hgreen-soft border-[#c4d3b8]" },
];

/** One real example of each card type, with the clue that gives it away. */
const readingGuide = [
  { type: "Gwang 광", look: "Has the 光 symbol", card: months[0].cards[0], color: "text-[#a06c00]" },
  { type: "Animal 열끗", look: "Shows a creature or object", card: months[1].cards[0], color: "text-[#7a5418]" },
  { type: "Ribbon 띠", look: "Has a hanging paper slip", card: months[0].cards[1], color: "text-hred" },
  { type: "Junk 피", look: "Only plants", card: months[0].cards[2], color: "text-hgreen" },
];

const trickyCards = [
  {
    name: "Sake cup",
    month: "Sep",
    card: months[8].cards[0],
    note: (
      <>
        counts as an <b>animal</b> or <b>double junk</b>, your pick. Agree on it first.
      </>
    ),
  },
  {
    name: "Rain Man 비광",
    month: "Dec",
    card: months[11].cards[0],
    note: (
      <>
        is the weakest gwang: 3 gwang that include it score only <b>2</b>, not 3.
      </>
    ),
  },
];

const swatch = "inline-block h-[9pt] w-[7pt] flex-none rounded-[1pt]";
const chip = "inline-block flex-none rounded-[2pt] px-[2pt] text-[5.5pt] leading-[1.5] font-bold text-white";
const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sets: { mark: React.ReactNode; ko: string; name: string; meaning: string; months: number[]; note?: string }[] = [
  { mark: <span className={`${swatch} bg-hred`} />, ko: "홍단", name: "Hongdan", meaning: "red ribbons", months: [1, 2, 3] },
  { mark: <span className={`${swatch} bg-hblue`} />, ko: "청단", name: "Cheongdan", meaning: "blue ribbons", months: [6, 9, 10] },
  { mark: <span className={`${swatch} rib-cho bg-hred`} />, ko: "초단", name: "Chodan", meaning: "grass ribbons", months: [4, 5, 7] },
  { mark: <span className={`${chip} bg-ink`}>G</span>, ko: "고도리", name: "Godori", meaning: "five birds", months: [2, 4, 8] },
  { mark: <span className={`${swatch} rib-plain bg-[#c76b3c]`} />, ko: "비띠", name: "Bi-tti", meaning: "rain ribbon", months: [12], note: "no set" },
  { mark: <span className={`${chip} bg-hgreen`}>×2</span>, ko: "쌍피", name: "Ssangpi", meaning: "double junk", months: [11, 12], note: "counts as 2" },
];

export function CardsPage() {
  return (
    <Sheet folio="Go-Stop Guide · Page 1 of 2 · The Cards">
      <header className="relative mb-[10pt] border-b-[2pt] border-ink pb-[6pt]">
        <GwangFan />
        <a
          href={siteUrl}
          className="absolute right-0 bottom-[5pt] flex flex-col items-center gap-[1.5pt] no-underline"
        >
          <QrCode url={siteUrl} className="size-[40pt] rounded-[2pt] ring-[0.75pt] ring-rule" />
          <span className="text-[5.8pt] leading-none font-semibold tracking-[0.02em] text-muted">
            {siteUrl.replace(/^https?:\/\//, "")}
          </span>
        </a>
        <h1 className="font-serif text-[30pt] leading-[1.15] font-black tracking-[-0.01em]">
          Go-Stop <Ko className="ml-[6pt] text-[22pt] text-hred">고스톱</Ko>
        </h1>
        <div className="mt-[3pt] text-[9pt] text-muted">
          A cheat sheet for the Korean flower-card game played with a <b className="font-semibold">hwatu</b> (화투) deck
        </div>
      </header>

      <div className="mb-[7pt] grid grid-cols-[1fr_1.3fr] gap-[20pt] [&_p]:mb-[4pt] [&_b]:font-semibold">
        <div>
          <SectionTitle ko="화투의 역사">A Short History</SectionTitle>
          <p>
            Portuguese sailors brought playing cards to Japan in the 1500s. When they were banned, card makers
            disguised the deck as 12 months of flowers: <b>hanafuda</b>. It reached Korea in the late 1800s as <b>hwatu</b> (화투, &ldquo;battle of
            flowers&rdquo;), and <b>Go-Stop</b> is now <i>the</i> game at Seollal and Chuseok family gatherings.
          </p>
          <p className="text-[7.4pt] text-muted">Fun fact: Nintendo was founded in 1889 to make hanafuda.</p>
        </div>
        <div>
          <SectionTitle ko="48장">The Deck</SectionTitle>
          <p>
            There are 12 months with 4 cards each. <b>Cards match by month</b> (by the flower), not by type. Every card
            is also one of four types:
          </p>
          <div className="grid grid-cols-4 gap-[5pt]">
            {types.map((t) => (
              <div key={t.t} className={`rounded-[4pt] border-[0.75pt] px-[5pt] pt-[5pt] pb-[4pt] ${t.cls}`}>
                <div className="font-serif text-[13pt] leading-none font-black">{t.n}</div>
                <div className="mt-[2pt] text-[8pt] font-bold whitespace-nowrap">{t.t}</div>
                <div className="text-[6.9pt] leading-[1.3] text-muted">{t.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle ko="월별 패">Matching Cards by Month</SectionTitle>
      <div className="grid grid-cols-3 gap-x-[10pt] gap-y-[5pt]">
        {months.map((m) => (
          <MonthBlock key={m.num} month={m} />
        ))}
      </div>

      <SetLegend />

      <div className="mt-[7pt] grid grid-cols-2 gap-[20pt] [&_b]:font-semibold">
        <Callout accent="var(--color-hblue)" tint="#e3ecfb">
          <NoteTitle icon={<InfoIcon />}>Reading the cards</NoteTitle>
          <ul className="mt-[4.5pt] grid grid-cols-2 gap-x-[8pt] gap-y-[2pt]">
            {readingGuide.map((g) => (
              <li key={g.type} className="flex items-center gap-[5pt]">
                <MiniCard card={g.card} />
                <span className="leading-[1.15]">
                  <b className={`block text-[8pt] font-bold ${g.color}`}>{g.type}</b>
                  <span className="text-[6.6pt] whitespace-nowrap text-muted">{g.look}</span>
                </span>
              </li>
            ))}
          </ul>
        </Callout>
        <Callout accent="var(--color-gold)" tint="var(--color-gold-soft)">
          <NoteTitle icon={<TipIcon />}>Two tricky cards</NoteTitle>
          <ul className="mt-[4.5pt] grid gap-y-[2pt]">
            {trickyCards.map((t) => (
              <li key={t.name} className="flex items-center gap-[5pt]">
                <MiniCard card={t.card} />
                <span className="leading-[1.25]">
                  <b className="font-bold">{t.name}</b> <span className="text-muted">({t.month})</span> {t.note}
                </span>
              </li>
            ))}
          </ul>
        </Callout>
      </div>
    </Sheet>
  );
}

function Callout({ accent, tint, children }: { accent: string; tint: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[3pt] border-[0.75pt] border-l-[3pt] border-rule px-[9pt] py-[4.5pt]"
      style={{ borderLeftColor: accent, backgroundColor: tint }}
    >
      {children}
    </div>
  );
}

function SetLegend() {
  return (
    <div className="relative mt-[7pt] rounded-[4pt] border-[0.75pt] border-rule bg-[#f4eddf] px-[5pt] pt-[7pt] pb-[4pt]">
      <span className="absolute -top-[5pt] left-[7pt] rounded-[2pt] bg-hred px-[4pt] text-[6pt] leading-[10pt] font-bold tracking-[0.08em] text-white uppercase shadow-[inset_0_0_0_0.75pt_var(--color-gold)]">
        Legend · Special sets
      </span>
      <div className="grid grid-cols-3 gap-[3pt] text-[7pt]">
        {sets.map((set) => (
          <div key={set.name} className="flex items-center gap-[4pt] rounded-[3pt] border-[0.6pt] border-rule bg-card px-[4pt] py-[1.5pt]">
            <span className="flex w-[11pt] justify-center">{set.mark}</span>
            <div className="min-w-0 flex-1">
              <div className="leading-[1.2] whitespace-nowrap">
                <Ko className="font-bold">{set.ko}</Ko> <b className="font-semibold">{set.name}</b>{" "}
                <span className="text-muted">&ldquo;{set.meaning}&rdquo;</span>
              </div>
              <div className="mt-[1.5pt] flex items-center gap-[2pt]">
                {set.months.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-[2pt] rounded-full border-[0.6pt] border-rule bg-card py-[0.5pt] pr-[3pt] pl-[0.5pt] text-[6pt] leading-none"
                  >
                    <span
                      className="grid size-[8pt] place-items-center rounded-full select-none text-[5pt] leading-none font-bold text-white tabular-nums"
                      style={{ backgroundColor: months[m - 1].color }}
                    >
                      <span className="[text-box:trim-both_cap_alphabetic]">{m}</span>
                    </span>
                    {monthAbbr[m - 1]}
                  </span>
                ))}
                {set.note && <span className="ml-[2pt] text-[6.3pt] font-semibold text-muted">· {set.note}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The five gwang cards fanned out like a winning hand. */
function GwangFan() {
  const gwang = months.flatMap((m) => m.cards.filter((c) => c.type === "gwang"));
  return (
    <div className="absolute right-[64pt] bottom-[14.25pt] h-[40pt] w-[110pt]" aria-hidden="true">
      {gwang.map((card, i) => {
        const angle = (i - 2) * 13;
        return (
          <div
            key={i}
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{ transform: `translateX(-50%) translateX(${(i - 2) * 15}pt) rotate(${angle}deg) scale(1.45)` }}
          >
            <MiniCard card={card} />
          </div>
        );
      })}
    </div>
  );
}

function NoteTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[4pt] py-[1pt]">
      {icon}
      {/* trim the line box to cap height so the icon centers on the letters, not the line */}
      <b className="[text-box:trim-both_cap_alphabetic]">{children}</b>
    </div>
  );
}

/** "i" in a blue circle: this box is reference info. */
function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[10pt] flex-none" aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fill="var(--color-hblue)" />
      <circle cx="10" cy="5.6" r="1.5" fill="#fff" />
      <rect x="8.6" y="8.4" width="2.8" height="7.2" rx="1.2" fill="#fff" />
    </svg>
  );
}

/** A lightbulb: this box is a tip. */
function TipIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[10pt] flex-none" aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fill="#a06c00" />
      <path d="M10 3.6a4.3 4.3 0 0 0-2.6 7.7c.5.4.8.9.8 1.5v.6h3.6v-.6c0-.6.3-1.1.8-1.5A4.3 4.3 0 0 0 10 3.6Z" fill="#fff" />
      <rect x="8.2" y="14.2" width="3.6" height="1.3" rx=".6" fill="#fff" />
      <rect x="8.7" y="16" width="2.6" height="1.1" rx=".5" fill="#fff" />
    </svg>
  );
}
