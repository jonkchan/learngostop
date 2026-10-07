/**
 * Go-Stop scoring, matching the rules on page 2 (How to Score, Go or Stop?, Penalties for losers).
 * Used by the score calculator.
 */

export type Hand = {
  gwang: number; // 0–5
  rainMan: boolean; // Dec gwang among them (only matters for exactly 3)
  animals: number; // 0–9
  godori: boolean; // all 3 birds (Feb, Apr, Aug)
  ribbons: number; // 0–10
  hongdan: boolean;
  cheongdan: boolean;
  chodan: boolean;
  junk: number; // junk value: double junk counts as 2
};

export type Loser = { piBak: boolean; gwangBak: boolean; goBak: boolean };

export type Extras = { goes: number; shakes: number; afterNagari: boolean };

export type Line = { label: string; pts: number };

/** Card points, line by line. */
export function cardPoints(h: Hand): Line[] {
  const lines: Line[] = [];
  if (h.gwang === 5) lines.push({ label: "O-gwang (5 gwang)", pts: 15 });
  else if (h.gwang === 4) lines.push({ label: "Sa-gwang (4 gwang)", pts: 4 });
  else if (h.gwang === 3)
    lines.push(h.rainMan ? { label: "Bi-sam-gwang (3 with Rain Man)", pts: 2 } : { label: "Sam-gwang (3 gwang)", pts: 3 });
  if (h.animals >= 5) lines.push({ label: `Animals (${h.animals})`, pts: h.animals - 4 });
  if (h.godori) lines.push({ label: "Godori (3 birds)", pts: 5 });
  if (h.ribbons >= 5) lines.push({ label: `Ribbons (${h.ribbons})`, pts: h.ribbons - 4 });
  if (h.hongdan) lines.push({ label: "Hongdan (red poems)", pts: 3 });
  if (h.cheongdan) lines.push({ label: "Cheongdan (blue)", pts: 3 });
  if (h.chodan) lines.push({ label: "Chodan (plain red)", pts: 3 });
  if (h.junk >= 10) lines.push({ label: `Junk (${h.junk})`, pts: h.junk - 9 });
  return lines;
}

/** What the Go count does to the score: 1 Go +1, 2 Go +2, then ×2, ×4, ×8. */
export function goEffect(goes: number): { add: number; mult: number } {
  if (goes <= 0) return { add: 0, mult: 1 };
  if (goes <= 2) return { add: goes, mult: 1 };
  return { add: 0, mult: 2 ** (goes - 2) };
}

export type Result = {
  lines: Line[];
  cardTotal: number;
  /** Score after Gos and the table-wide doublings (Shake/Bomb, Nagari, Meong-tta), before per-loser penalties. */
  score: number;
  steps: string[];
  meongTta: boolean;
  /** Whether the winner scored with gwang / junk, so Gwang-bak / Pi-bak can apply. */
  scoredWithGwang: boolean;
  scoredWithJunk: boolean;
  /** What each loser pays, after their own penalties and any Go-bak. */
  pays: number[];
  payNotes: string[][];
};

export function settle(h: Hand, extras: Extras, losers: Loser[]): Result {
  const lines = cardPoints(h);
  const cardTotal = lines.reduce((n, l) => n + l.pts, 0);
  const steps: string[] = [`${cardTotal} card pts`];

  const go = goEffect(extras.goes);
  let score = cardTotal + go.add;
  if (go.add) steps.push(`+${go.add} for ${extras.goes} Go`);
  score *= go.mult;
  if (go.mult > 1) steps.push(`×${go.mult} for ${extras.goes} Go`);
  if (extras.shakes > 0) {
    score *= 2 ** extras.shakes;
    steps.push(`×${2 ** extras.shakes} for ${extras.shakes === 1 ? "Shake / Bomb" : `${extras.shakes} Shakes / Bombs`}`);
  }
  if (extras.afterNagari) {
    score *= 2;
    steps.push("×2 after Nagari");
  }
  const meongTta = h.animals >= 7;
  if (meongTta) {
    score *= 2;
    steps.push("×2 Meong-tta");
  }

  const scoredWithGwang = h.gwang >= 3;
  const scoredWithJunk = h.junk >= 10;
  // each loser's own penalties
  const own = losers.map((l) => {
    let pay = score;
    const notes: string[] = [];
    if (l.piBak && scoredWithJunk) {
      pay *= 2;
      notes.push("Pi-bak ×2");
    }
    if (l.gwangBak && scoredWithGwang) {
      pay *= 2;
      notes.push("Gwang-bak ×2");
    }
    return { pay, notes };
  });
  // Go-bak: a loser who had called Go pays everyone's share; the others pay nothing
  const goBak = losers.findIndex((l) => l.goBak);
  const pays = own.map((o, i) => (goBak < 0 ? o.pay : i === goBak ? own.reduce((n, x) => n + x.pay, 0) : 0));
  const payNotes = own.map((o, i) =>
    goBak < 0 ? o.notes : i === goBak ? ["Go-bak: pays for everyone", ...o.notes] : ["covered by Go-bak"],
  );

  return { lines, cardTotal, score, steps, meongTta, scoredWithGwang, scoredWithJunk, pays, payNotes };
}
