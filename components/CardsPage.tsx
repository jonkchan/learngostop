import { months, type Card } from "@/lib/deck";
import { LegendTile, MONTH_GRID_ID } from "./Highlight";
import { MiniCard } from "./HwatuCard";
import { siteUrl } from "@/lib/site";
import { MonthBlock } from "./MonthBlock";
import { QrCode } from "./QrCode";
import { QrExpand } from "./QrExpand";
import { Ko, SectionTitle, Sheet } from "./Sheet";

/** The four card types, each with two example cards fanned in its corner. */
const types: { n: number; t: string; d: string; cls: string; type: Card["type"]; fan: [Card, Card] }[] = [
  { n: 5, t: "Gwang 광", d: "The 5 most valuable cards. Marked 光.", cls: "bg-gold-soft border-gold", type: "gwang", fan: [months[0].cards[0], months[7].cards[0]] },
  { n: 9, t: "Animal 열끗", d: "Show an animal or object. Marked 열 here.", cls: "bg-tan border-rule", type: "animal", fan: [months[6].cards[0], months[9].cards[0]] },
  { n: 10, t: "Ribbon 띠", d: "Have a paper ribbon: red, blue, or plain.", cls: "bg-hred-soft border-[#e7b9b4]", type: "ribbon", fan: [months[0].cards[1], months[5].cards[1]] },
  { n: 24, t: "Junk 피", d: "Just the plant. A few count double (×2).", cls: "bg-hgreen-soft border-[#c4d3b8]", type: "pi", fan: [months[2].cards[2], months[10].cards[2]] },
];

const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** months[m - 1].cards[i]: a real card by month number and position. */
const card = (m: number, i: number) => months[m - 1].cards[i];

/** Laid out 4 across: ribbon sets + the lone rain ribbon on top, birds / animals / double junk / sake cup below. */
const allAnimals = months.flatMap((m) => m.cards.filter((c) => c.type === "animal"));

const sets: {
  cards: Card[];
  /** Cards to highlight in the grid; defaults to `cards`. */
  highlight?: Card[];
  ko: string;
  name: string;
  meaning: string;
  months: number[];
  note?: string;
}[] = [
  { cards: [card(1, 1), card(2, 1), card(3, 1)], ko: "홍단", name: "Hongdan", meaning: "red ribbons", months: [1, 2, 3] },
  { cards: [card(6, 1), card(9, 1), card(10, 1)], ko: "청단", name: "Cheongdan", meaning: "blue ribbons", months: [6, 9, 10] },
  { cards: [card(4, 1), card(5, 1), card(7, 1)], ko: "초단", name: "Chodan", meaning: "grass ribbons", months: [4, 5, 7] },
  { cards: [card(12, 2)], ko: "비띠", name: "Bi-tti", meaning: "rain ribbon", months: [12] },
  { cards: [card(2, 0), card(4, 0), card(8, 1)], ko: "고도리", name: "Godori", meaning: "five birds", months: [2, 4, 8] },
  { cards: [card(7, 0), card(10, 0), card(6, 0)], highlight: allAnimals, ko: "열끗", name: "Animals", meaning: "marked 열", months: [], note: "9 cards" },
  { cards: [card(11, 1), card(12, 3)], ko: "쌍피", name: "Ssangpi", meaning: "double junk", months: [11, 12] },
  { cards: [card(9, 0)], ko: "술잔", name: "Sake cup", meaning: "animal or ×2 junk", months: [9] },
];

export function CardsPage() {
  return (
    <Sheet className="select-none" folio="Go-Stop Guide · Page 1 of 2 · Art: Spenĉjo (CC BY-SA 4.0) · Icons: Sem (CC BY 4.0)">
      <header className="relative mb-[10pt] border-b-[2pt] border-ink pb-[6pt]">
        <GwangFan />
        <QrExpand
          label={siteUrl.replace(/^https?:\/\//, "")}
          className="absolute right-0 bottom-[5pt] flex flex-col items-center gap-[1.5pt]"
          large={<QrCode url={siteUrl} className="size-full rounded-[6px] p-[10px]" />}
        >
          <QrCode url={siteUrl} className="size-[40pt] rounded-[2pt] ring-[0.75pt] ring-rule" />
          <span className="text-[5.8pt] leading-none font-semibold tracking-[0.02em] text-muted">
            {siteUrl.replace(/^https?:\/\//, "")}
          </span>
        </QrExpand>
        <h1 className="font-serif text-[30pt] leading-[1.15] font-black tracking-[-0.01em]">
          Go-Stop <Ko className="ml-[6pt] text-[22pt] text-hred">고스톱</Ko>
        </h1>
        <div className="mt-[3pt] text-[9pt] text-muted">
          A cheat sheet for the Korean flower-card game played with a <b className="font-semibold">hwatu</b> (화투) deck
        </div>
      </header>

      <div className="mb-[5pt] grid grid-cols-[1fr_1.3fr] gap-[20pt] [&_p]:mb-[4pt] [&_b]:font-semibold">
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
            12 months × 4 cards, each month with its own flower. You <b>match cards of the same month</b>. Each card
            is also one of four types:
          </p>
          <div className="grid grid-cols-4 gap-[5pt]">
            {types.map((t) => (
              <LegendTile
                key={t.t}
                setKey={`type-${t.type}`}
                ids={months.flatMap((m) => m.cards.filter((c) => c.type === t.type).map((c) => c.img ?? ""))}
                className={`relative block rounded-[4pt] border-[0.75pt] px-[5pt] pt-[5pt] pb-[4pt] ${t.cls}`}
              >
                {/* two real cards of this type, fanned in the corner */}
                <span className="absolute -top-[4pt] right-[4pt] flex" aria-hidden="true">
                  <span className="-rotate-[9deg]">
                    <MiniCard card={t.fan[0]} size="h-[22pt] w-[13.5pt]" showTag={false} />
                  </span>
                  <span className="-ml-[6pt] translate-y-[1pt] rotate-[8deg]">
                    <MiniCard card={t.fan[1]} size="h-[22pt] w-[13.5pt]" showTag={false} />
                  </span>
                </span>
                <div className="font-serif text-[13pt] leading-none font-black">{t.n}</div>
                <div className="mt-[2pt] text-[8pt] font-bold whitespace-nowrap">{t.t}</div>
                <div className="text-[6.9pt] leading-[1.3] text-muted">{t.d}</div>
              </LegendTile>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle ko="월별 패">Matching Cards by Month</SectionTitle>
      <div id={MONTH_GRID_ID} className="grid scroll-mt-[40pt] grid-cols-3 gap-x-[12pt] gap-y-[6pt]">
        {months.map((m) => (
          <MonthBlock key={m.num} month={m} />
        ))}
      </div>

      <SetLegend />

    </Sheet>
  );
}

function SetLegend() {
  return (
    <div className="relative mt-[7pt] rounded-[4pt] border-[0.75pt] border-rule bg-[#f4eddf] px-[6pt] pt-[8pt] pb-[4pt]">
      <span className="absolute -top-[5pt] left-[7pt] rounded-[2pt] bg-hred px-[4pt] text-[6pt] leading-[10pt] font-bold tracking-[0.08em] text-white uppercase shadow-[inset_0_0_0_0.75pt_var(--color-gold)]">
        Legend
      </span>
      <span className="absolute -top-[4pt] left-[44pt] rounded-[2pt] bg-[#f4eddf] px-[3pt] text-[6pt] leading-[8pt] text-muted italic print:hidden">
        tap a set to find its cards
      </span>
      <div className="grid grid-cols-4 gap-[4pt] text-[7.4pt]">
        {sets.map((set) => (
          <LegendTile
            key={set.name}
            setKey={set.name}
            ids={(set.highlight ?? set.cards).map((c) => c.img ?? "")}
            className="flex items-center gap-[4pt] rounded-[3pt] border-[0.6pt] border-rule bg-card px-[4pt] py-[2pt]"
          >
            {/* the actual cards in the set, fanned, so they're easy to spot in the grid above */}
            <span className="flex w-[27pt] flex-none justify-center">
              {set.cards.map((c, k) => (
                <span key={k} className={k ? "-ml-[6pt]" : ""}>
                  <MiniCard card={c} size="h-[18.5pt] w-[11.4pt]" showTag={false} />
                </span>
              ))}
            </span>
            <div className="min-w-0 flex-1">
              <div className="leading-[1.15] whitespace-nowrap">
                <Ko className="font-bold">{set.ko}</Ko> <b className="font-semibold">{set.name}</b>
              </div>
              <div className="text-[6.8pt] leading-[1.25] whitespace-nowrap text-muted">&ldquo;{set.meaning}&rdquo;</div>
              <div className="mt-[1.5pt] flex items-center gap-[2pt] whitespace-nowrap">
                {set.months.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-[2pt] rounded-full border-[0.6pt] border-rule bg-card py-[0.5pt] pr-[3pt] pl-[0.5pt] text-[6.5pt] leading-none"
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
                {set.note && (
                  <span className="text-[6.5pt] font-semibold text-muted">
                    {set.months.length ? "· " : ""}
                    {set.note}
                  </span>
                )}
              </div>
            </div>
          </LegendTile>
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
            className="absolute bottom-0 left-1/2 origin-bottom hover:z-10"
            style={{ transform: `translateX(-50%) translateX(${(i - 2) * 15}pt) rotate(${angle}deg) scale(1.45)` }}
          >
            {/* on hover the card pops out of the fan: lifts, straightens (undoes the fan angle) and grows */}
            <div
              className="origin-bottom transition-[translate,rotate,scale,filter] duration-200 ease-out hover:-translate-y-[5pt] hover:scale-[1.15] hover:rotate-[var(--unfan)] hover:drop-shadow-[0_3pt_4pt_rgba(0,0,0,0.35)]"
              style={{ "--unfan": `${-angle}deg` } as React.CSSProperties}
            >
              <MiniCard card={card} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
