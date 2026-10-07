import type { ReactNode } from "react";
import { cardIds } from "@/lib/deck";
import { HighlightRow } from "./Highlight";
import { PlayerArea } from "./PlayerArea";
import { Ko, SectionTitle, Sheet, Terms } from "./Sheet";

const steps: ReactNode[] = [
  <>
    <b>Match by month.</b> Play a card from your hand that&rsquo;s the <b>same month</b> as a table card, onto that
    card. No match? Play any card face-up on the table.
  </>,
  <>
    <b>Flip the top card of the draw pile.</b> If it&rsquo;s the same month as a table card, put it on that card
    too.
  </>,
  <>
    <b>2 table cards of that month?</b> Whether you played or flipped, capture just <b>one</b> (your choice); the
    other stays. <b>3?</b> Capture all 3 plus your card.
  </>,
  <>
    <b>Claim your pairs off the table</b> and keep them face-up <b>in front of you</b>. Sort <b>each card</b> by
    its own type, not by pair, so a pair can split across piles (see below).
  </>,
  <>
    <b>Check your score.</b> If you reached the target, or scored more since your last Go, call <b>Go</b> or{" "}
    <b>Stop</b>.
  </>,
];

const specialPlays = [
  { term: "Ppeok", ko: "뻑", def: <>You match, then flip the <b>same month</b>: all 3 stay stuck. Whoever captures them later gets 1 junk from each opponent, or <b>2</b> if they originally got the pile stuck (자뻑).</> },
  { term: "Jjok", ko: "쪽", def: "No match, but the flip matches your card: take both; each opponent gives you 1 junk." },
  { term: "Ttadak", ko: "따닥", def: "Play the 3rd of a month, flip the 4th: take all 4; each opponent gives you 1 junk." },
  { term: "Sseul", ko: "쓸", def: "You clear the table. Each opponent gives you 1 junk." },
  { term: "Shake", ko: "흔들기", def: <>3 of a month in your hand? Show all 3 when you play the first one. If you win, score <b>×2</b>.</> },
  { term: "Bomb", ko: "폭탄", def: <>Like Shake, but the 4th is on the table: play all 3 at once, take all 4. Each opponent gives you 1 junk; if you win, <b>×2</b>. Later, take <b>2 flip-only turns</b> (you&rsquo;re 2 cards short).</> },
  { term: "Chongtong", ko: "총통", def: "Dealt all 4 of a month? You win instantly (usually 10 pts)." },
];

const penalties = [
  { term: "Pi-bak", ko: "피박", def: "The winner scored with junk and you have fewer than 6 junk." },
  { term: "Gwang-bak", ko: "광박", def: "Winner scored with gwang; you have none." },
  { term: "Meong-tta", ko: "멍따", def: "Winner has 7+ animals: everyone pays ×2." },
];

type Row = { name: string; ko?: string; dot?: string; need: ReactNode; pts: string; cards: string[] };

const gwang = cardIds((c) => c.type === "gwang");
const ribbonsOf = (ms: number[]) => cardIds((c, m) => c.type === "ribbon" && ms.includes(m));

const scoring: { group: string; tint: string; cards: string[]; rows: Row[] }[] = [
  {
    group: "Gwang 광",
    tint: "bg-gold-soft",
    cards: gwang,
    rows: [
      { name: "Sam-gwang", ko: "삼광", need: <>Any 3 gwang <i>without</i> Rain Man (Dec)</>, pts: "3", cards: cardIds((c, m) => c.type === "gwang" && m !== 12) },
      { name: "Bi-sam-gwang", ko: "비삼광", need: <>3 gwang <i>including</i> Rain Man (Dec)</>, pts: "2", cards: gwang },
      { name: "Sa-gwang", ko: "사광", need: "Any 4 gwang", pts: "4", cards: gwang },
      { name: "O-gwang", ko: "오광", need: "All 5 gwang", pts: "15", cards: gwang },
    ],
  },
  {
    group: "Animals 열끗",
    tint: "bg-tan",
    cards: cardIds((c) => c.type === "animal"),
    rows: [
      { name: "Animals", need: "5 animals, +1 pt for each extra", pts: "1+", cards: cardIds((c) => c.type === "animal") },
      { name: "Godori", ko: "고도리", dot: "bg-ink", need: "All 3 birds (Feb, Apr, Aug)", pts: "5", cards: cardIds((c, m) => c.type === "animal" && [2, 4, 8].includes(m)) },
    ],
  },
  {
    group: "Ribbons 띠",
    tint: "bg-hred-soft",
    cards: cardIds((c) => c.type === "ribbon"),
    rows: [
      { name: "Ribbons", need: "5 ribbons, +1 pt for each extra", pts: "1+", cards: cardIds((c) => c.type === "ribbon") },
      { name: "Hongdan", ko: "홍단", dot: "bg-hred", need: "Red poems: Jan, Feb, Mar", pts: "3", cards: ribbonsOf([1, 2, 3]) },
      { name: "Cheongdan", ko: "청단", dot: "bg-hblue", need: "Blue: Jun, Sep, Oct", pts: "3", cards: ribbonsOf([6, 9, 10]) },
      { name: "Chodan", ko: "초단", dot: "bg-[#e58a8f]", need: "Plain red: Apr, May, Jul", pts: "3", cards: ribbonsOf([4, 5, 7]) },
    ],
  },
  {
    group: "Junk 피",
    tint: "bg-hgreen-soft",
    cards: cardIds((c) => c.type === "pi"),
    rows: [{ name: "Junk", need: "10 junk, +1 pt for each extra (×2 cards count as 2)", pts: "1+", cards: cardIds((c) => c.type === "pi") }],
  },
];

/** Cards dealt per pass around the table: [to each player, to the table]. */
const dealOrder: { who: string; passes: [number, number][]; hand: number; table: number; pile: number }[] = [
  { who: "3 players", passes: [[4, 3], [3, 3]], hand: 7, table: 6, pile: 21 },
  { who: "2 players", passes: [[5, 4], [5, 4]], hand: 10, table: 8, pile: 20 },
];

const goLadder = [
  ["1 Go", "+1"],
  ["2 Go", "+2"],
  ["3 Go", "×2"],
  ["4 Go", "×4"],
  ["5 Go", "×8"],
];

const th = "border-b-[1pt] border-ink px-[4pt] py-[2.4pt] text-left text-[6.8pt] font-semibold tracking-[0.06em] text-muted uppercase";
const td = "border-b-[0.6pt] border-rule px-[4pt] py-[2.4pt] align-top";
const thNum = th.replace("text-left", "text-center");
const groupTh = "border-b-[0.6pt] border-rule px-[4pt] pb-[1pt] text-center text-[6.8pt] font-bold tracking-[0.06em] text-ink uppercase";
const tdNum = `${td} text-center font-semibold tabular-nums`;

export function RulesPage() {
  return (
    <Sheet folio="Go-Stop Guide · Page 2 of 2 · Rules & Scoring · House rules vary, so agree before the first deal">
      <header className="mb-[9pt] flex items-end justify-between border-b-[2pt] border-ink pb-[6pt]">
        <div>
          <h2 className="font-serif text-[22pt] leading-[1.15] font-black">
            How to Play <Ko className="ml-[6pt] text-[16pt] text-hred">게임 방법</Ko>
          </h2>
          <div className="mt-[3pt] text-[9pt] text-muted">
            2–3 players. First to the target score may call Go or Stop.
          </div>
        </div>
        <div className="flex items-center gap-[6pt] rounded-[5pt] bg-gold px-[8pt] py-[4pt] text-ink shadow-[inset_0_0_0_1.2pt_#c99b2b]">
          <span className="text-[6.8pt] leading-[1.2] font-bold tracking-[0.06em] uppercase">
            Target
            <br />
            score
          </span>
          {[
            ["3 players", "3"],
            ["2 players", "7"],
          ].map(([who, pts]) => (
            <span key={who} className="self-stretch border-l-[0.75pt] border-[#c99b2b] pl-[6pt] text-center leading-none">
              <span className="block pt-[1pt] font-serif text-[16pt] font-black text-[#7d0b1a]">{pts}</span>
              <span className="text-[6.8pt] font-semibold">{who}</span>
            </span>
          ))}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-[16pt] [&_b]:font-semibold">
        {/* LEFT */}
        <div>
          <SectionTitle ko="패 돌리기">Setup &amp; Deal</SectionTitle>
          <div className="mb-[2pt] text-[6.8pt] font-semibold tracking-[0.06em] text-muted uppercase">
            Deal in 2 passes · counter-clockwise from dealer&rsquo;s right
          </div>
          <table className="mb-[5pt] w-full border-collapse text-[8pt]">
            <thead>
              <tr>
                <th></th>
                {["1st pass", "2nd pass", "After the deal"].map((g) => (
                  <th key={g} colSpan={g === "After the deal" ? 3 : 2} className={groupTh}>
                    {g}
                  </th>
                ))}
              </tr>
              <tr>
                <th className={th}></th>
                {[1, 2].flatMap((r) => [
                  <th key={`${r}p`} className={thNum}>
                    Each
                    <br />
                    player
                  </th>,
                  <th key={`${r}t`} className={`${thNum} bg-hgreen-soft`}>
                    Table
                  </th>,
                ])}
                <th className={`${thNum} border-l-[0.6pt] border-l-rule`}>
                  Each
                  <br />
                  hand
                </th>
                <th className={thNum}>Table</th>
                <th className={thNum}>Pile</th>
              </tr>
            </thead>
            <tbody>
              {dealOrder.map(({ who, passes, hand, table, pile }) => (
                <tr key={who}>
                  <td className={`${td} font-semibold whitespace-nowrap`}>{who}</td>
                  {passes.flatMap(([each, toTable], r) => [
                    <td key={`${r}p`} className={tdNum}>
                      {each}
                    </td>,
                    <td key={`${r}t`} className={`${tdNum} bg-hgreen-soft`}>
                      {toTable}
                    </td>,
                  ])}
                  <td className={`${tdNum} border-l-[0.6pt] border-l-rule text-hred`}>{hand}</td>
                  <td className={`${tdNum} text-hred`}>{table}</td>
                  <td className={`${tdNum} text-hred`}>{pile}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mb-[4pt] text-[7.4pt]">
            Deal hands face-down, table face-up. The <b>dealer is dealt last but plays first</b>, then turns go
            counter-clockwise. The last hand&rsquo;s winner deals next.
          </p>

          <SectionTitle ko="차례">Your Turn</SectionTitle>
          <ol className="mb-[4pt]">
            {steps.map((step, i) => (
              <li key={i} className="relative mb-[3.5pt] pl-[17pt]">
                <span className="absolute top-[0.5pt] left-0 grid size-[12pt] place-items-center rounded-full bg-hred select-none text-[7pt] leading-none font-bold text-white tabular-nums">
                  <span className="[text-box:trim-both_cap_alphabetic]">{i + 1}</span>
                </span>
                {step}
              </li>
            ))}
          </ol>
          <PlayerArea />

          <SectionTitle ko="특수 상황">Special Plays</SectionTitle>
          <Terms items={specialPlays} />
        </div>

        {/* RIGHT */}
        <div>
          <SectionTitle ko="점수">How to Score</SectionTitle>
          <table className="w-full border-collapse text-[8pt]">
            <thead>
              <tr>
                <th className={th}>Combination</th>
                <th className={th}>You need</th>
                <th className={`${th} text-right`}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {scoring.map((g) => (
                <ScoreGroup key={g.group} group={g.group} tint={g.tint} cards={g.cards} rows={g.rows} />
              ))}
            </tbody>
          </table>
          <p className="mt-[3pt] mb-[4pt] text-[7.4pt] text-muted">
            <b className="text-ink">Everything adds up.</b> A card can count toward more than one row: 5 animals that
            include the 3 godori birds score 5 + 1 = <b className="text-ink">6 pts</b>.
          </p>

          <SectionTitle ko="고 / 스톱" className="mt-[9pt]">
            Go or Stop?
          </SectionTitle>
          <div className="mt-[4pt] mb-[7pt] grid grid-cols-[1fr_auto_1fr] items-stretch">
            <div className={`${goStopBox} bg-hred`}>
              <GoStopLabel en="GO" ko="고" icon={<GoIcon />} />
              Keep playing for a bigger payout. You can call again only after your score goes up.
            </div>
            <div className="z-10 -mx-[2pt] grid size-[18pt] place-items-center self-center rounded-full bg-gold font-serif text-[8pt] font-black text-ink shadow-[0_0_0_1.5pt_var(--color-paper)] select-none">
              or
            </div>
            <div className={`${goStopBox} bg-ink`}>
              <GoStopLabel en="STOP" ko="스톱" icon={<StopIcon />} />
              The hand ends now. Everyone pays you your points × multipliers. This is the safe choice.
            </div>
          </div>
          <div className="mb-[6pt] grid grid-cols-5 gap-[3pt]">
            {goLadder.map(([label, effect]) => (
              <div key={label} className="rounded-[3pt] border-[0.75pt] border-rule bg-card py-[2pt] text-center">
                <b className="block text-[6.8pt] font-semibold text-muted">{label}</b>
                <span className="font-serif text-[10pt] font-black text-hred">{effect}</span>
              </div>
            ))}
          </div>
          <div className="mb-[5pt] rounded-[4pt] border-[0.75pt] border-l-[2.5pt] border-[#efb3ae] border-l-hred bg-[#fdeeec] px-[6pt] pt-[3pt] pb-[3.5pt] text-[7.4pt]">
            <div className="mb-[2pt] flex items-center gap-[4pt] text-[6.8pt] font-black tracking-[0.06em] text-hred uppercase">
              <WarningIcon />
              <span className="[text-box:trim-both_cap_alphabetic]">Watch out: two ways a hand goes wrong</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-[6pt] gap-y-[2.5pt]">
              <dt className="font-bold whitespace-nowrap text-hred">
                Go-bak <Ko>고박</Ko>
              </dt>
              <dd>
                You called Go, then someone else wins: <b className="text-hred">you pay their winnings for everyone.</b>
              </dd>
              <dt className="font-bold whitespace-nowrap text-hred">
                Nagari <Ko>나가리</Ko>
              </dt>
              <dd>
                Cards run out with no Stop: a draw. Nobody is paid, not even a Go-caller; next hand pays <b>×2</b>.
              </dd>
            </dl>
          </div>
          <h3 className="mt-[10pt] mb-[2pt] font-serif text-[9.6pt] leading-[1.15] font-bold">
            Penalties for losers <span className="font-medium text-muted">박 · loser pays ×2</span>
          </h3>
          <Terms items={penalties} />

          <div className="mt-[9pt] flex items-center gap-[6pt] rounded-[3pt] border-[0.75pt] border-gold bg-gold-soft px-[7pt] py-[5pt] text-[7.6pt]">
            <CalculatorIcon />
            <p>
              <b>Example:</b> You hit 3 pts and call <b>Go</b>. Your cards reach 4, so you choose again and{" "}
              <b>Stop</b>: 4 + 1 (for the Go) = <b>5 pts</b>.
            </p>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function ScoreGroup({ group, tint, cards, rows }: { group: string; tint: string; cards: string[]; rows: Row[] }) {
  return (
    <>
      <HighlightRow setKey={group} ids={cards}>
        <td colSpan={3} className={`${td} ${tint} pt-[3pt] text-[7.2pt] font-bold tracking-[0.05em] text-hred uppercase`}>
          {group}
        </td>
      </HighlightRow>
      {rows.map((r, i) => (
        <HighlightRow key={i} setKey={r.name} ids={r.cards}>
          <td className={`${td} whitespace-nowrap`}>
            {r.dot && <Dot className={r.dot} />}
            {r.name}
            {r.ko && <Ko className="ml-[3pt] leading-none text-hred">{r.ko}</Ko>}
          </td>
          <td className={td}>{r.need}</td>
          <td className={`${td} text-right font-bold whitespace-nowrap`}>{r.pts}</td>
        </HighlightRow>
      ))}
    </>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`mr-[3pt] inline-block size-[6pt] rounded-full align-[0.5pt] ${className}`} />;
}

const goStopBox =
  "rounded-[5pt] px-[7pt] pt-[6pt] pb-[6pt] text-white shadow-[inset_0_0_0_1.5pt_var(--color-gold),0_2.5pt_0_rgba(0,0,0,0.22)]";

function GoStopLabel({ en, ko, icon }: { en: string; ko: string; icon: ReactNode }) {
  return (
    <div className="mb-[3pt] flex items-center gap-[5pt] font-serif text-[18pt] leading-none font-black tracking-[0.02em]">
      {icon}
      {en}
      <span className="text-[10pt] text-gold">{ko}</span>
    </div>
  );
}

/** A calculator in a dark-gold circle: marks the worked scoring example. */
function CalculatorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[13pt] flex-none" aria-hidden="true">
      <circle cx="12" cy="12" r="11.5" fill="#a06c00" />
      <rect x="7" y="5" width="10" height="14" rx="1.6" fill="#fff" />
      <rect x="8.6" y="6.6" width="6.8" height="2.8" rx="0.6" fill="#a06c00" />
      {[11.6, 14.4, 17.2].flatMap((y) =>
        [9.4, 12, 14.6].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y - 0.4} r="0.95" fill="#a06c00" />),
      )}
    </svg>
  );
}

/** A red warning triangle. */
function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[12pt] flex-none" aria-hidden="true">
      <path d="M12 2 L23 21 H1 Z" fill="var(--color-hred)" stroke="var(--color-hred)" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="10.8" y="8.5" width="2.4" height="7" rx="1" fill="#fff" />
      <circle cx="12" cy="18" r="1.4" fill="#fff" />
    </svg>
  );
}

/** A stop-sign octagon. */
function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15pt] flex-none" aria-hidden="true">
      <polygon points="7,1 17,1 23,7 23,17 17,23 7,23 1,17 1,7" fill="var(--color-hred)" stroke="#fff" strokeWidth="2" />
      <rect x="6.5" y="10.5" width="11" height="3" rx="1" fill="#fff" />
    </svg>
  );
}

/** A forward "play" arrow in a gold disc. */
function GoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[15pt] flex-none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--color-gold)" stroke="#fff" strokeWidth="2" />
      <polygon points="9.5,6.5 18,12 9.5,17.5" fill="var(--color-hred)" />
    </svg>
  );
}
