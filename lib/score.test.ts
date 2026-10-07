// Tests for the score calculator's math. Run with `npm test` (Node's built-in test runner, no extra deps).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { cardPoints, goEffect, settle, type Extras, type Hand, type Loser } from "./score.ts";

const hand = (h: Partial<Hand> = {}): Hand => ({
  gwang: 0,
  rainMan: false,
  animals: 0,
  godori: false,
  ribbons: 0,
  hongdan: false,
  cheongdan: false,
  chodan: false,
  junk: 0,
  ...h,
});
const extras = (e: Partial<Extras> = {}): Extras => ({ goes: 0, shakes: 0, afterNagari: false, ...e });
const loser = (l: Partial<Loser> = {}): Loser => ({ piBak: false, gwangBak: false, goBak: false, ...l });
const pts = (h: Partial<Hand>) => cardPoints(hand(h)).reduce((n, l) => n + l.pts, 0);

describe("card points (How to Score table)", () => {
  test("gwang: 3 = 3, 3 with Rain Man = 2, 4 = 4, 5 = 15, fewer than 3 = 0", () => {
    assert.equal(pts({ gwang: 2 }), 0);
    assert.equal(pts({ gwang: 3 }), 3);
    assert.equal(pts({ gwang: 3, rainMan: true }), 2);
    assert.equal(pts({ gwang: 4 }), 4);
    assert.equal(pts({ gwang: 4, rainMan: true }), 4); // Rain Man only matters for exactly 3
    assert.equal(pts({ gwang: 5 }), 15);
  });

  test("animals: 5 = 1, +1 per extra; Godori adds 5", () => {
    assert.equal(pts({ animals: 4 }), 0);
    assert.equal(pts({ animals: 5 }), 1);
    assert.equal(pts({ animals: 7 }), 3);
    assert.equal(pts({ animals: 3, godori: true }), 5);
  });

  test("the page's 'everything adds up' example: 5 animals incl. the 3 godori birds = 6", () => {
    assert.equal(pts({ animals: 5, godori: true }), 6);
  });

  test("ribbons: 5 = 1, +1 per extra; each ribbon set adds 3", () => {
    assert.equal(pts({ ribbons: 4 }), 0);
    assert.equal(pts({ ribbons: 5 }), 1);
    assert.equal(pts({ ribbons: 6 }), 2);
    assert.equal(pts({ ribbons: 3, hongdan: true }), 3);
    assert.equal(pts({ ribbons: 9, hongdan: true, cheongdan: true, chodan: true }), 5 + 9);
  });

  test("junk: 10 = 1, +1 per extra", () => {
    assert.equal(pts({ junk: 9 }), 0);
    assert.equal(pts({ junk: 10 }), 1);
    assert.equal(pts({ junk: 12 }), 3);
  });

  test("categories add together", () => {
    assert.equal(pts({ gwang: 3, animals: 5, ribbons: 5, junk: 10 }), 3 + 1 + 1 + 1);
  });
});

describe("Go bonuses (Go ladder: +1, +2, ×2, ×4, ×8)", () => {
  test("goEffect", () => {
    assert.deepEqual(goEffect(0), { add: 0, mult: 1 });
    assert.deepEqual(goEffect(1), { add: 1, mult: 1 });
    assert.deepEqual(goEffect(2), { add: 2, mult: 1 });
    assert.deepEqual(goEffect(3), { add: 0, mult: 2 });
    assert.deepEqual(goEffect(4), { add: 0, mult: 4 });
    assert.deepEqual(goEffect(5), { add: 0, mult: 8 });
  });

  // the Go/Stop demo's scenarios
  test("Go once: 4 pts + 1 = 5 from each", () => {
    assert.deepEqual(settle(hand({ gwang: 4 }), extras({ goes: 1 }), [loser(), loser()]).pays, [5, 5]);
  });
  test("Go twice: 5 pts + 2 = 7", () => {
    assert.equal(settle(hand({ gwang: 4, junk: 10 }), extras({ goes: 2 }), [loser()]).score, 7);
  });
  test("Go three times: 6 pts × 2 = 12", () => {
    assert.equal(settle(hand({ ribbons: 10 }), extras({ goes: 3 }), [loser()]).score, 12);
  });
});

describe("table-wide doublings", () => {
  test("each Shake / Bomb doubles", () => {
    assert.equal(settle(hand({ gwang: 3 }), extras({ shakes: 1 }), [loser()]).score, 6);
    assert.equal(settle(hand({ gwang: 3 }), extras({ shakes: 2 }), [loser()]).score, 12);
  });
  test("after a Nagari the next hand pays ×2", () => {
    assert.equal(settle(hand({ gwang: 3 }), extras({ afterNagari: true }), [loser()]).score, 6);
  });
  test("Meong-tta (7+ animals) doubles for everyone, automatically", () => {
    const r = settle(hand({ animals: 7 }), extras(), [loser(), loser()]);
    assert.equal(r.meongTta, true);
    assert.deepEqual(r.pays, [6, 6]); // 3 pts × 2
  });
  test("6 animals is not Meong-tta", () => {
    assert.equal(settle(hand({ animals: 6 }), extras(), [loser()]).meongTta, false);
  });
  test("Go bonus applies before the doublings", () => {
    // (4 + 1 Go) × 2 Shake = 10
    assert.equal(settle(hand({ gwang: 4 }), extras({ goes: 1, shakes: 1 }), [loser()]).score, 10);
  });
});

describe("penalties for losers", () => {
  test("Pi-bak doubles only that loser (penalty demo: B pays 10, C pays 5)", () => {
    // 5 pts with 3 from junk: 12 junk (3) + 2 from... use ribbons 6 (2)
    const r = settle(hand({ junk: 12, ribbons: 6 }), extras(), [loser({ piBak: true }), loser()]);
    assert.equal(r.score, 5);
    assert.deepEqual(r.pays, [10, 5]);
  });
  test("Pi-bak doesn't apply unless the winner scored with junk", () => {
    assert.deepEqual(settle(hand({ gwang: 3 }), extras(), [loser({ piBak: true })]).pays, [3]);
  });
  test("Gwang-bak doubles only that loser", () => {
    assert.deepEqual(settle(hand({ gwang: 3, ribbons: 6 }), extras(), [loser({ gwangBak: true }), loser()]).pays, [10, 5]);
  });
  test("Gwang-bak doesn't apply unless the winner scored with gwang", () => {
    assert.deepEqual(settle(hand({ junk: 12 }), extras(), [loser({ gwangBak: true })]).pays, [3]);
  });
  test("penalties stack: Pi-bak + Gwang-bak = ×4", () => {
    assert.deepEqual(settle(hand({ gwang: 3, junk: 10 }), extras(), [loser({ piBak: true, gwangBak: true })]).pays, [16]);
  });
  test("penalties multiply on top of Go bonuses (6 × 2 for 3 Gos, Pi-bak ×2 = 24)", () => {
    assert.deepEqual(settle(hand({ junk: 15 }), extras({ goes: 3 }), [loser({ piBak: true })]).pays, [24]);
  });
});

describe("Go-bak", () => {
  test("the loser who called Go pays everyone's share; the other pays nothing (demo: 3 pts, you pay 6)", () => {
    const r = settle(hand({ gwang: 3 }), extras(), [loser({ goBak: true }), loser()]);
    assert.deepEqual(r.pays, [6, 0]);
    assert.deepEqual(r.payNotes[1], ["covered by Go-bak"]);
  });
  test("Go-bak covers the other loser's penalties too", () => {
    // 5 pts with junk; C has Pi-bak (10), B pays their own 5 + C's 10
    const r = settle(hand({ junk: 12, ribbons: 6 }), extras(), [loser({ goBak: true }), loser({ piBak: true })]);
    assert.deepEqual(r.pays, [15, 0]);
  });
});

describe("totals", () => {
  test("the winner receives what the losers pay", () => {
    const r = settle(hand({ gwang: 3, junk: 10 }), extras({ goes: 1 }), [loser({ piBak: true }), loser()]);
    assert.deepEqual(r.pays, [10, 5]);
    assert.equal(r.pays.reduce((n, p) => n + p, 0), 15);
  });
  test("2 players: one loser", () => {
    assert.deepEqual(settle(hand({ gwang: 4, ribbons: 7 }), extras(), [loser()]).pays, [7]);
  });
  test("nothing captured scores nothing", () => {
    const r = settle(hand(), extras(), [loser(), loser()]);
    assert.equal(r.score, 0);
    assert.deepEqual(r.pays, [0, 0]);
  });
});
