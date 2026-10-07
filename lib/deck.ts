export type RibbonKind = "hong" | "cheong" | "cho" | "plain";

export type Card = (
  | { type: "gwang"; caption: string }
  | { type: "animal"; caption: string; tag?: string }
  | { type: "ribbon"; caption: string; ribbon: RibbonKind }
  | { type: "pi"; caption: string; tag?: string }
) & {
  /** Card art (filled in below from the month number and position). */
  img?: string;
};

export type Month = {
  num: number;
  name: string;
  ko: string;
  note: string;
  /** Accent color drawn from the month's flower. */
  color: string;
  cards: [Card, Card, Card, Card];
};

const junk: Card = { type: "pi", caption: "Junk" };
const doubleJunk: Card = { type: "pi", caption: "×2 junk", tag: "×2" };

const baseMonths: Month[] = [
  {
    num: 1, name: "January · Pine", ko: "송학", note: "Pine & crane", color: "#1f7a3a",
    cards: [{ type: "gwang", caption: "Crane" }, { type: "ribbon", caption: "Red poem", ribbon: "hong" }, junk, junk],
  },
  {
    num: 2, name: "February · Plum", ko: "매조", note: "Plum blossom & bird", color: "#c62828",
    cards: [{ type: "animal", caption: "Warbler", tag: "G" }, { type: "ribbon", caption: "Red poem", ribbon: "hong" }, junk, junk],
  },
  {
    num: 3, name: "March · Cherry", ko: "벚꽃", note: "Cherry blossom", color: "#e0458f",
    cards: [{ type: "gwang", caption: "Curtain" }, { type: "ribbon", caption: "Red poem", ribbon: "hong" }, junk, junk],
  },
  {
    num: 4, name: "April · Wisteria", ko: "흑싸리", note: "“Black bush clover”", color: "#7a3fc4",
    cards: [{ type: "animal", caption: "Cuckoo", tag: "G" }, { type: "ribbon", caption: "Plain red", ribbon: "cho" }, junk, junk],
  },
  {
    num: 5, name: "May · Iris", ko: "난초", note: "Iris / orchid", color: "#1a6ad8",
    cards: [{ type: "animal", caption: "Bridge" }, { type: "ribbon", caption: "Plain red", ribbon: "cho" }, junk, junk],
  },
  {
    num: 6, name: "June · Peony", ko: "모란", note: "Peony & butterflies", color: "#a6189c",
    cards: [{ type: "animal", caption: "Butterflies" }, { type: "ribbon", caption: "Blue", ribbon: "cheong" }, junk, junk],
  },
  {
    num: 7, name: "July · Bush Clover", ko: "홍싸리", note: "“Red bush clover” & boar", color: "#6c8a12",
    cards: [{ type: "animal", caption: "Boar" }, { type: "ribbon", caption: "Plain red", ribbon: "cho" }, junk, junk],
  },
  {
    num: 8, name: "August · Moon", ko: "공산", note: "Pampas grass & full moon", color: "#b87800",
    cards: [{ type: "gwang", caption: "Full Moon" }, { type: "animal", caption: "Geese", tag: "G" }, junk, junk],
  },
  {
    num: 9, name: "September · Mum", ko: "국진", note: "Chrysanthemum & sake cup", color: "#0c8582",
    cards: [{ type: "animal", caption: "Sake Cup", tag: "×2?" }, { type: "ribbon", caption: "Blue", ribbon: "cheong" }, junk, junk],
  },
  {
    num: 10, name: "October · Maple", ko: "단풍", note: "Maple leaves & deer", color: "#c4520a",
    cards: [{ type: "animal", caption: "Deer" }, { type: "ribbon", caption: "Blue", ribbon: "cheong" }, junk, junk],
  },
  {
    num: 11, name: "November · Paulownia", ko: "오동", note: "Nicknamed 똥 (ttong)", color: "#7a4f2a",
    cards: [{ type: "gwang", caption: "Phoenix" }, doubleJunk, junk, junk],
  },
  {
    num: 12, name: "December · Rain", ko: "비", note: "Rain, willow & umbrella man", color: "#46586b",
    cards: [
      { type: "gwang", caption: "Rain Man" },
      { type: "animal", caption: "Swallow" },
      { type: "ribbon", caption: "Rain ribbon", ribbon: "plain" },
      doubleJunk,
    ],
  },
];

/**
 * Card art: /cards/MM-N.svg, by Spenĉjo on Wikimedia Commons (CC BY-SA 4.0), credited in the page 1 footer.
 * N is the card's position within its month, matching the order above.
 */
export const months: Month[] = baseMonths.map((m) => ({
  ...m,
  cards: m.cards.map((c, i) => ({ ...c, img: `/cards/${String(m.num).padStart(2, "0")}-${i + 1}.svg` })) as Month["cards"],
}));

const typeLabel: Record<Card["type"], string> = {
  gwang: "Gwang 광",
  animal: "Animal 열끗",
  ribbon: "Ribbon 띠",
  pi: "Junk 피",
};

/** What a card is for, beyond its type: the set it belongs to or its special rule. */
function cardRole(month: number, card: Card): string | undefined {
  if (card.type === "gwang") return month === 12 ? "weakest gwang: 3 with it score only 2" : undefined;
  if (card.type === "animal") {
    if ([2, 4, 8].includes(month)) return "one of the 3 Godori birds";
    if (month === 9) return "counts as an animal or double junk";
  }
  if (card.type === "ribbon") {
    if ([1, 2, 3].includes(month)) return "one of the 3 Hongdan (red poem) ribbons";
    if ([6, 9, 10].includes(month)) return "one of the 3 Cheongdan (blue) ribbons";
    if ([4, 5, 7].includes(month)) return "one of the 3 Chodan (plain red) ribbons";
    return "not part of any ribbon set";
  }
  if (card.type === "pi" && "tag" in card && card.tag === "×2") return "counts as 2 junk";
}

/** Tooltip text for a card in the month grid. */
export function describeCard(month: Month, card: Card) {
  const role = cardRole(month.num, card);
  return {
    title: card.caption,
    month: `${month.name} ${month.ko}`,
    detail: role ? `${typeLabel[card.type]} · ${role}` : typeLabel[card.type],
  };
}

/** Image ids of every card matching a test, for highlighting sets from the scoring table. */
export function cardIds(test: (card: Card, month: number) => boolean): string[] {
  return months.flatMap((m) => m.cards.filter((c) => test(c, m.num)).map((c) => c.img ?? ""));
}
