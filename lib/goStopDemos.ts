/**
 * Step-by-step scripts for the Go or Stop demo: one hand, six ways it can end.
 * Points are each player's card points; `goes` counts the Gos *you* have called.
 */

export type Player = "you" | "b" | "c";

export type GoStopFrame = {
  caption: string;
  points: Record<Player, number>;
  goes: number;
  /** A big GO / STOP stamp on the player who just called. */
  call?: { who: Player; what: "GO" | "STOP" };
  /** Final settlement: + received, − paid. */
  pay?: Record<Player, number>;
  /** A short label for how the hand ended (shown over the table). */
  ending?: string;
};

export type GoStopScenario = { key: string; label: string; frames: GoStopFrame[] };

const pts = (you: number, b = 1, c = 2): Record<Player, number> => ({ you, b, c });

export const goStopScenarios: GoStopScenario[] = [
  {
    key: "stop",
    label: "Stop at 3",
    frames: [
      { caption: "Everyone is capturing cards. You have 2 points.", points: pts(2), goes: 0 },
      { caption: "You reach 3 points, the target. Time to choose: Go or Stop?", points: pts(3), goes: 0 },
      { caption: "You play it safe and call Stop. The hand ends right away.", points: pts(3), goes: 0, call: { who: "you", what: "STOP" } },
      { caption: "Each opponent pays you your 3 points.", points: pts(3), goes: 0, pay: { you: 6, b: -3, c: -3 }, ending: "+3 from each" },
    ],
  },
  {
    key: "go1",
    label: "Go once",
    frames: [
      { caption: "You reach 3 points.", points: pts(3), goes: 0 },
      { caption: "You call Go: the hand keeps going, for a bigger payout.", points: pts(3), goes: 1, call: { who: "you", what: "GO" } },
      { caption: "A turn later your cards reach 4. Your score went up, so you get to choose again.", points: pts(4), goes: 1 },
      { caption: "You call Stop: 4 points + 1 for your Go = 5.", points: pts(4), goes: 1, call: { who: "you", what: "STOP" } },
      { caption: "Each opponent pays you 5.", points: pts(4), goes: 1, pay: { you: 10, b: -5, c: -5 }, ending: "4 + 1 = 5 each" },
    ],
  },
  {
    key: "go2",
    label: "Go twice",
    frames: [
      { caption: "You reach 3 points and call Go.", points: pts(3), goes: 1, call: { who: "you", what: "GO" } },
      { caption: "Your cards reach 4. You push your luck and call Go again.", points: pts(4), goes: 2, call: { who: "you", what: "GO" } },
      { caption: "Your cards reach 5, and you call Stop.", points: pts(5), goes: 2, call: { who: "you", what: "STOP" } },
      { caption: "2 Gos add 2: 5 + 2 = 7 from each opponent.", points: pts(5), goes: 2, pay: { you: 14, b: -7, c: -7 }, ending: "5 + 2 = 7 each" },
    ],
  },
  {
    key: "go3",
    label: "Go three times",
    frames: [
      { caption: "You reach 3 points and call Go.", points: pts(3), goes: 1, call: { who: "you", what: "GO" } },
      { caption: "At 4, Go again.", points: pts(4), goes: 2, call: { who: "you", what: "GO" } },
      { caption: "At 5, a third Go. From the 3rd Go on, your score is doubled instead.", points: pts(5), goes: 3, call: { who: "you", what: "GO" } },
      { caption: "Your cards reach 6, and you finally Stop.", points: pts(6), goes: 3, call: { who: "you", what: "STOP" } },
      { caption: "3 Gos double it: 6 × 2 = 12 from each opponent.", points: pts(6), goes: 3, pay: { you: 24, b: -12, c: -12 }, ending: "6 × 2 = 12 each" },
    ],
  },
  {
    key: "gobak",
    label: "Go-bak",
    frames: [
      { caption: "You reach 3 points and call Go.", points: pts(3), goes: 1, call: { who: "you", what: "GO" } },
      { caption: "Before your score goes up again, Player B catches up to 3 points…", points: pts(3, 3), goes: 1 },
      { caption: "…and Player B calls Stop. B wins the hand.", points: pts(3, 3), goes: 1, call: { who: "b", what: "STOP" } },
      {
        caption: "Normally you and C would each pay B 3. But you called Go and lost, so you pay for both: 6. C pays nothing.",
        points: pts(3, 3),
        goes: 1,
        pay: { you: -6, b: 6, c: 0 },
        ending: "Go-bak: you pay 6",
      },
    ],
  },
  {
    key: "nagari",
    label: "Nagari",
    frames: [
      { caption: "You reach 3 points and call Go.", points: pts(3), goes: 1, call: { who: "you", what: "GO" } },
      { caption: "Nobody's score goes up for the rest of the hand…", points: pts(3), goes: 1 },
      { caption: "…and the cards run out with no one having called Stop.", points: pts(3), goes: 1 },
      {
        caption: "Nagari: a draw. Nobody is paid, not even you with 3 points. The next hand pays ×2.",
        points: pts(3),
        goes: 1,
        pay: { you: 0, b: 0, c: 0 },
        ending: "Draw · next hand ×2",
      },
    ],
  },
];
