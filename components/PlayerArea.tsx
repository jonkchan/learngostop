import { months, type Card } from "@/lib/deck";
import { MiniCard } from "./HwatuCard";
import { Zoomable } from "./Zoomable";

/** months[m - 1].cards[i] — look up a real card by month number and position. */
const card = (m: number, i: number): Card => months[m - 1].cards[i];

const piles: { label: string; ko: string; cards: Card[]; overlap: string; score: string; pts: number; why: string }[] = [
  { label: "Gwang", ko: "광", cards: [card(1, 0), card(3, 0), card(8, 0)], overlap: "-ml-[8pt]", score: "3 gwang = 3", pts: 3, why: "No Rain Man among them, so the full 3 points (Sam-gwang)" },
  { label: "Animals", ko: "열끗", cards: [card(2, 0), card(4, 0), card(8, 1), card(10, 0)], overlap: "-ml-[9pt]", score: "Godori = 5", pts: 5, why: "Godori: all 3 birds. Only 4 animals, so no animal points yet" },
  { label: "Ribbons", ko: "띠", cards: [card(6, 1), card(9, 1), card(10, 1), card(1, 1)], overlap: "-ml-[9pt]", score: "Cheongdan = 3", pts: 3, why: "Cheongdan: all 3 blue ribbons. Only 4 ribbons, so no ribbon points yet" },
  {
    label: "Junk",
    cards: [...[1, 2, 3, 4, 5, 6, 7, 9].map((m) => card(m, 2)), card(11, 1)],
    ko: "피",
    overlap: "-ml-[11pt]",
    score: "10 junk = 1",
    pts: 1,
    why: "9 cards, but the ×2 card counts double: 10 junk = 1 pt",
  },
];

export function PlayerArea() {
  return (
    <Zoomable
      label="Example: your side of the table"
      large={<LargeExample />}
      className="mb-[5pt] rounded-[5pt] bg-[#f1e6d2] px-[6pt] pt-[4pt] pb-[5pt] text-ink shadow-[inset_0_0_0_1.2pt_var(--color-gold)]"
    >
      <div className="mb-[3pt] flex items-center justify-between text-[7pt]">
        <span className="font-semibold">Example: your side of the table</span>
        <span className="rounded-full bg-gold px-[5pt] py-[0.5pt] text-[6.5pt] font-bold text-ink shadow-[0_1pt_0_rgba(0,0,0,0.3)]">
          Total <b className="font-serif text-[8.5pt] font-black text-ink">12 pts</b>
        </span>
      </div>
      <div className="flex justify-between gap-[6pt]">
        {piles.map((p) => (
          <div key={p.label} className="flex flex-col items-start">
            <div className="mb-[1.5pt] text-[6.3pt] font-bold tracking-[0.04em] text-[#7a5418] uppercase">
              {p.label} <span className="font-normal text-muted">· {p.cards.length}</span>
            </div>
            <div className="flex drop-shadow-[0_1pt_1pt_rgba(0,0,0,0.15)]">
              {p.cards.map((c, i) => (
                <div key={i} className={i === 0 ? "" : p.overlap}>
                  <MiniCard card={c} />
                </div>
              ))}
            </div>
            <div className="mt-[2pt] rounded-[2pt] border-[0.6pt] border-rule bg-card px-[2.5pt] text-[6.5pt] font-bold whitespace-nowrap text-hred">
              {p.score}
            </div>
          </div>
        ))}
      </div>
    </Zoomable>
  );
}

/** The enlarged example shown in the overlay: bigger, more spread-out piles and how each one scores. */
function LargeExample() {
  const total = piles.reduce((n, p) => n + p.pts, 0);
  return (
    <div className="text-ink">
      <div className="mb-[16px] flex flex-wrap items-baseline justify-between gap-[8px]">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.06em] text-muted uppercase">Example</div>
          <div className="font-serif text-[22px] leading-tight font-black">Your side of the table</div>
        </div>
        <div className="rounded-full bg-gold px-[14px] py-[4px] text-[14px] font-bold shadow-[0_2px_0_rgba(0,0,0,0.25)]">
          Total <b className="font-serif text-[22px] font-black">{total} pts</b>
        </div>
      </div>
      <div className="grid gap-[14px] sm:grid-cols-2">
        {piles.map((p, pileIndex) => (
          <div key={p.label} className="rounded-[12px] bg-[#f1e6d2] p-[14px] shadow-[inset_0_0_0_1.5px_var(--color-gold)]">
            <div className="mb-[8px] flex items-baseline justify-between">
              <div className="text-[13px] font-bold tracking-[0.05em] text-[#7a5418] uppercase">
                {p.label} <span className="font-serif normal-case">{p.ko}</span>{" "}
                <span className="font-normal text-muted">· {p.cards.length} cards</span>
              </div>
              <div className="font-serif text-[20px] font-black text-hred">+{p.pts}</div>
            </div>
            <div className="flex drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
              {p.cards.map((c, i) => (
                <div
                  key={i}
                  // dealt in pile by pile, card by card; on hover the card lifts most and its neighbours a little
                  className={`deal-in relative transition-[translate] duration-200 ease-out hover:z-10 hover:-translate-y-[14px] motion-reduce:transition-none [&:has(+:hover)]:-translate-y-[6px] [:hover+&]:-translate-y-[6px] ${
                    i === 0 ? "" : p.cards.length > 5 ? "-ml-[22px]" : "-ml-[10px]"
                  }`}
                  style={{ animationDelay: `${pileIndex * 140 + i * 55}ms` }}
                >
                  <MiniCard card={c} size="h-[86px] w-[53px]" />
                </div>
              ))}
            </div>
            <div className="mt-[10px] text-[13px] leading-snug">
              <b className="text-hred">{p.score}.</b> <span className="text-muted">{p.why}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[16px] text-center text-[14px] text-muted">
        {piles.map((p) => p.pts).join(" + ")} = <b className="text-ink">{total} points</b>
      </div>
    </div>
  );
}
