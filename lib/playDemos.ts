/**
 * Step-by-step scripts for the Special Plays demos.
 * Cards are referred to by "MM-N" (month, position), matching /public/cards/MM-N.svg.
 * Each frame lists where every visible card sits; a card left out of a frame is hidden.
 */

export type Zone = "hand" | "table" | "pile" | "mine" | "opp";

export type Place = {
  zone: Zone;
  slot: number;
  /** Position within a stack of cards on one table slot (0 = bottom). */
  stack?: number;
  faceDown?: boolean;
  /** Lifted and glowing: the card being flipped, or a stuck pile. */
  lift?: boolean;
  /** Raised out of the hand to show it (Shake, Chongtong). */
  raised?: boolean;
};

export type Frame = { caption: string; at: Record<string, Place>; badge?: string };

export type Demo = { title: string; frames: Frame[] };

const hand = (slot: number, more: Partial<Place> = {}): Place => ({ zone: "hand", slot, ...more });
const table = (slot: number, stack = 0, more: Partial<Place> = {}): Place => ({ zone: "table", slot, stack, ...more });
const pile = (more: Partial<Place> = {}): Place => ({ zone: "pile", slot: 0, faceDown: true, ...more });
const mine = (slot: number): Place => ({ zone: "mine", slot });
const opp = (slot: number): Place => ({ zone: "opp", slot });

/** The two junk cards opponents hand over in the "each opponent gives you 1 junk" plays. */
const GIVE = ["01-3", "08-3"];
const giveFrames = (base: Record<string, Place>, firstMine: number, caption: string): Frame[] => [
  { caption, at: { ...base, [GIVE[0]]: opp(0), [GIVE[1]]: opp(1) } },
  { caption, at: { ...base, [GIVE[0]]: mine(firstMine), [GIVE[1]]: mine(firstMine + 1) } },
];

export const demos: Record<string, Demo> = {
  // Not a special play: three ordinary turns, for the "Your Turn" steps.
  "Your Turn": (() => {
    // turn 1: play January onto its match; the flip (August) has no match and stays
    const t1 = { "01-1": hand(0), "06-1": hand(1), "04-1": hand(2), "12-3": hand(3), "01-3": table(0), "04-3": table(1), "04-2": table(2), "08-3": pile() };
    const after1 = { "06-1": hand(1), "04-1": hand(2), "12-3": hand(3), "04-3": table(1), "04-2": table(2), "08-3": table(3), "01-1": mine(0), "01-3": mine(1) };
    // turn 2: June has no match and stays; the flip (August) matches the August on the table
    const played2 = { ...after1, "06-1": table(0), "08-4": pile() };
    const after2 = { ...after1, "06-1": table(0), "08-3": mine(2), "08-4": mine(3) };
    // turn 3: two Aprils on the table; you choose the ribbon over the junk
    const played3 = { ...after2, "04-1": table(2, 1), "03-3": pile() };
    const after3 = { ...after2, "04-1": mine(4), "04-2": mine(5), "03-3": table(3) };
    const frames: Frame[] = [
      { caption: "Your turn. Look for a card in your hand that's the same month as a card on the table.", at: t1 },
      { caption: "You have January, and so does the table. Play it on top of its match.", at: { ...t1, "01-1": table(0, 1) } },
      { caption: "Then flip the top card of the draw pile: August.", at: { ...t1, "01-1": table(0, 1), "08-3": pile({ faceDown: false, lift: true }) } },
      { caption: "No August on the table, so the flipped card just stays there.", at: { ...t1, "01-1": table(0, 1), "08-3": table(3) } },
      { caption: "Claim your pair: both January cards go in front of you.", at: after1 },
      { caption: "Next turn. Nothing in your hand matches the table, but you still have to play a card.", at: { ...after1, "06-1": hand(1, { raised: true }) } },
      { caption: "Play June anyway. With no match, it just stays on the table.", at: { ...after1, "06-1": table(0) } },
      { caption: "Flip the pile: August!", at: { ...played2, "08-4": pile({ faceDown: false, lift: true }) } },
      { caption: "It matches the August card left on the table last turn.", at: { ...played2, "08-4": table(3, 1) } },
      { caption: "Claim the August pair. Your June stays behind for anyone to match later.", at: after2 },
      { caption: "Next turn. You play April, but there are two Aprils on the table.", at: { ...after2, "04-1": hand(2, { raised: true }), "04-3": table(1, 0, { lift: true }), "04-2": table(2, 0, { lift: true }) } },
      { caption: "You choose which one to take. Pick the ribbon: it's worth more than the junk card.", at: { ...after2, "04-1": table(2, 1) } },
      { caption: "Flip the pile: March. No match, so it stays on the table.", at: { ...played3, "03-3": table(3) } },
      { caption: "Claim your April and the ribbon. The other April stays on the table.", at: after3 },
    ];
    // the rest of the draw pile: one face-down card that never moves, so the pile doesn't vanish after a flip
    return {
      title: "Your turn 차례 · three example turns",
      frames: frames.map((f) => ({ ...f, at: { "12-4": pile(), ...f.at } })),
    };
  })(),

  Ppeok: (() => {
    const start = { "03-1": hand(0), "12-2": hand(1), "03-3": table(0), "09-3": table(1), "03-4": pile() };
    const stuck = { ...start, "03-1": table(0, 1, { lift: true }), "03-3": table(0, 0, { lift: true }), "03-4": table(0, 2, { lift: true }) };
    const taken = { "12-2": hand(1), "09-3": table(1), "03-1": mine(0), "03-2": mine(1), "03-3": mine(2), "03-4": mine(3) };
    return {
      title: "Ppeok 뻑 · the stuck pile",
      frames: [
        { caption: "There's a March card on the table, and you hold another March card.", at: start },
        { caption: "You play it onto the matching March card…", at: { ...start, "03-1": table(0, 1) } },
        { caption: "…then flip the top of the pile. It's March too!", at: { ...start, "03-1": table(0, 1), "03-4": pile({ faceDown: false, lift: true }) } },
        { caption: "Ppeok! All 3 March cards are stuck on the table. Nobody takes them yet.", at: stuck },
        { caption: "On a later turn, someone plays the 4th March card onto the stuck pile…", at: { ...stuck, "03-2": table(0, 3) } },
        ...giveFrames(taken, 4, "…and takes all 4, plus 1 junk from each opponent (2 each if they originally got the pile stuck: 자뻑)."),
      ],
    };
  })(),

  Jjok: (() => {
    const start = { "02-1": hand(0), "06-1": hand(1), "05-3": table(0), "10-3": table(1), "02-3": pile() };
    const taken = { "06-1": hand(1), "05-3": table(0), "10-3": table(1), "02-1": mine(0), "02-3": mine(1) };
    return {
      title: "Jjok 쪽 · the lucky flip",
      frames: [
        { caption: "No February on the table, but you play your February card anyway.", at: start },
        { caption: "It has no match, so it just sits on the table.", at: { ...start, "02-1": table(2) } },
        { caption: "You flip the top of the pile… it's February!", at: { ...start, "02-1": table(2), "02-3": pile({ faceDown: false, lift: true }) } },
        { caption: "The flip matches the card you just played: Jjok!", at: { ...start, "02-1": table(2), "02-3": table(2, 1) } },
        ...giveFrames(taken, 2, "Take both, and each opponent gives you 1 junk."),
      ],
    };
  })(),

  Ttadak: (() => {
    const start = { "04-1": hand(0), "09-1": hand(1), "04-3": table(0, 0), "04-4": table(0, 1), "11-3": table(1), "04-2": pile() };
    const taken = { "09-1": hand(1), "11-3": table(1), "04-1": mine(0), "04-2": mine(1), "04-3": mine(2), "04-4": mine(3) };
    return {
      title: "Ttadak 따닥 · all four at once",
      frames: [
        { caption: "Two April cards are on the table, and you hold the 3rd.", at: start },
        { caption: "You play the 3rd April onto them…", at: { ...start, "04-1": table(0, 2) } },
        { caption: "…then flip the pile. It's the 4th April!", at: { ...start, "04-1": table(0, 2), "04-2": pile({ faceDown: false, lift: true }) } },
        { caption: "Ttadak! All 4 Aprils are yours.", at: { ...start, "04-1": table(0, 2), "04-2": table(0, 3) } },
        ...giveFrames(taken, 4, "Take all 4, and each opponent gives you 1 junk."),
      ],
    };
  })(),

  Sseul: (() => {
    const start = { "05-1": hand(0), "01-1": hand(1), "05-3": table(0), "06-4": table(1), "06-3": pile() };
    const taken = { "01-1": hand(1), "05-1": mine(0), "05-3": mine(1), "06-3": mine(2), "06-4": mine(3) };
    return {
      title: "Sseul 쓸 · sweep the table",
      frames: [
        { caption: "Only two cards are left on the table: a May and a June.", at: start },
        { caption: "You match the May card…", at: { ...start, "05-1": table(0, 1) } },
        { caption: "…and flip the pile. It's June!", at: { ...start, "05-1": table(0, 1), "06-3": pile({ faceDown: false, lift: true }) } },
        { caption: "It matches the June card, so both pairs are yours.", at: { ...start, "05-1": table(0, 1), "06-3": table(1, 1) } },
        { caption: "The table is now empty: Sseul!", at: taken },
        ...giveFrames(taken, 4, "Each opponent gives you 1 junk."),
      ],
    };
  })(),

  Shake: (() => {
    const start = { "07-1": hand(0), "07-2": hand(1), "07-3": hand(2), "03-2": hand(3), "11-1": hand(4), "05-4": table(0), "12-3": table(1) };
    const shown = { ...start, "07-1": hand(0, { raised: true }), "07-2": hand(1, { raised: true }), "07-3": hand(2, { raised: true }) };
    return {
      title: "Shake 흔들기 · show your triple",
      frames: [
        { caption: "You're holding 3 July cards, and there's no July on the table.", at: start },
        { caption: "Show all 3 to the table when you play the first one: that's a Shake.", at: shown },
        { caption: "Then play one as normal. The other two stay in your hand.", at: { ...start, "07-1": table(2) } },
        { caption: "If you win this hand, your score is doubled.", at: { ...start, "07-1": table(2) }, badge: "×2" },
      ],
    };
  })(),

  Bomb: (() => {
    const start = { "10-1": hand(0), "10-2": hand(1), "10-3": hand(2), "02-2": hand(3), "06-3": hand(4), "10-4": table(0), "03-3": table(1) };
    const taken = { "02-2": hand(3), "06-3": hand(4), "03-3": table(1), "10-1": mine(0), "10-2": mine(1), "10-3": mine(2), "10-4": mine(3) };
    return {
      title: "Bomb 폭탄 · three at once",
      frames: [
        { caption: "You hold 3 October cards, and the 4th October is on the table.", at: start },
        { caption: "Play all 3 at once onto it: Bomb!", at: { ...start, "10-1": table(0, 1), "10-2": table(0, 2), "10-3": table(0, 3) } },
        ...giveFrames(taken, 4, "Take all 4, and each opponent gives you 1 junk."),
        { caption: "If you win, your score is doubled.", at: { ...taken, "01-3": mine(4), "08-3": mine(5) }, badge: "×2" },
        { caption: "You're now 2 cards short, so on 2 later turns you skip your hand and just flip.", at: { ...taken, "01-3": mine(4), "08-3": mine(5) } },
      ],
    };
  })(),

  Chongtong: (() => {
    const ids = ["11-1", "11-2", "11-3", "11-4", "02-3", "05-2", "08-2"];
    const dealt = Object.fromEntries(ids.map((id, i) => [id, hand(i, { faceDown: true })]));
    const up = Object.fromEntries(ids.map((id, i) => [id, hand(i)]));
    const shown = Object.fromEntries(ids.map((id, i) => [id, hand(i, { raised: i < 4 })]));
    return {
      title: "Chongtong 총통 · a dealt-in win",
      frames: [
        { caption: "The cards are dealt…", at: dealt },
        { caption: "You pick up your hand.", at: up },
        { caption: "All 4 November cards in one hand: Chongtong!", at: shown },
        { caption: "You win instantly (usually 10 points). No need to play the hand.", at: shown, badge: "WIN" },
      ],
    };
  })(),
};
