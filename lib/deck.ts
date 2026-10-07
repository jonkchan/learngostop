export type RibbonKind = "hong" | "cheong" | "cho" | "plain";

export type Card =
  | { type: "gwang"; caption: string }
  | { type: "animal"; caption: string; tag?: string }
  | { type: "ribbon"; caption: string; ribbon: RibbonKind }
  | { type: "pi"; caption: string; tag?: string };

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
const doubleJunk: Card = { type: "pi", caption: "Double junk", tag: "×2" };

export const months: Month[] = [
  {
    num: 1, name: "January · Pine", ko: "송학", note: "Pine & crane", color: "#1f7a3a",
    cards: [{ type: "gwang", caption: "Crane & Sun" }, { type: "ribbon", caption: "Red poem", ribbon: "hong" }, junk, junk],
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
    num: 10, name: "October · Maple", ko: "단풍", note: "Maple leaves & deer", color: "#e2620e",
    cards: [{ type: "animal", caption: "Deer" }, { type: "ribbon", caption: "Blue", ribbon: "cheong" }, junk, junk],
  },
  {
    num: 11, name: "November · Paulownia", ko: "오동", note: "Nicknamed 똥 (ttong)", color: "#7a4f2a",
    cards: [{ type: "gwang", caption: "Phoenix" }, doubleJunk, junk, junk],
  },
  {
    num: 12, name: "December · Rain", ko: "비", note: "Rain, willow & umbrella man", color: "#46586b",
    cards: [
      { type: "gwang", caption: "Rain Man 비광" },
      { type: "animal", caption: "Swallow" },
      { type: "ribbon", caption: "Rain ribbon", ribbon: "plain" },
      doubleJunk,
    ],
  },
];
