import { months, type Card } from "@/lib/deck";
import { MiniCard } from "./HwatuCard";

/** months[m - 1].cards[i] — look up a real card by month number and position. */
const card = (m: number, i: number): Card => months[m - 1].cards[i];

const piles: { label: string; cards: Card[]; overlap: string; score: string }[] = [
  { label: "Gwang", cards: [card(1, 0), card(3, 0), card(8, 0)], overlap: "-ml-[8pt]", score: "3 gwang = 3" },
  { label: "Animals", cards: [card(2, 0), card(4, 0), card(8, 1), card(10, 0)], overlap: "-ml-[9pt]", score: "Godori = 5" },
  { label: "Ribbons", cards: [card(6, 1), card(9, 1), card(10, 1), card(1, 1)], overlap: "-ml-[9pt]", score: "Cheongdan = 3" },
  {
    label: "Junk",
    cards: [...[1, 2, 3, 4, 5, 6, 7, 9].map((m) => card(m, 2)), card(11, 1)],
    overlap: "-ml-[11pt]",
    score: "10 junk = 1",
  },
];

export function PlayerArea() {
  return (
    <div className="mb-[5pt] rounded-[5pt] bg-[#f1e6d2] px-[6pt] pt-[4pt] pb-[5pt] text-ink shadow-[inset_0_0_0_1.2pt_var(--color-gold)]">
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
    </div>
  );
}
