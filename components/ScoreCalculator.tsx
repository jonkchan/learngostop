"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { goEffect, settle, type Hand, type Loser } from "@/lib/score";
import { ViewportOverlay } from "./ViewportOverlay";

const emptyHand: Hand = {
  gwang: 0,
  rainMan: false,
  animals: 0,
  godori: false,
  ribbons: 0,
  hongdan: false,
  cheongdan: false,
  chodan: false,
  junk: 0,
};
const noPenalty: Loser = { piBak: false, gwangBak: false, goBak: false };

/**
 * The score calculator dialog: the winner's captured cards in, final score and what each player pays out.
 * Stays mounted while the page is open (it just renders nothing when closed), so the numbers survive closing it.
 */
export function ScoreCalculator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [players, setPlayers] = useState<2 | 3>(3);
  const [hand, setHand] = useState<Hand>(emptyHand);
  const [goes, setGoes] = useState(0);
  const [shakes, setShakes] = useState(0);
  const [afterNagari, setAfterNagari] = useState(false);
  const [losers, setLosers] = useState<Loser[]>([noPenalty, noPenalty]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const opponents = losers.slice(0, players - 1);
  const r = settle(hand, { goes, shakes, afterNagari }, opponents);
  const target = players === 3 ? 3 : 7;
  const set = <K extends keyof Hand>(k: K, v: Hand[K]) => setHand((h) => ({ ...h, [k]: v }));
  const setLoser = (i: number, k: keyof Loser, v: boolean) =>
    setLosers((ls) =>
      ls.map((l, j) =>
        j === i ? { ...l, [k]: v } : k === "goBak" && v ? { ...l, goBak: false } : l, // only one player can Go-bak
      ),
    );
  const reset = () => {
    setHand(emptyHand);
    setGoes(0);
    setShakes(0);
    setAfterNagari(false);
    setLosers([noPenalty, noPenalty]);
  };
  const names = ["Player B", "Player C"];

  return (
    <ViewportOverlay>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Score calculator"
        onClick={onClose}
        className="absolute inset-0 grid grid-cols-[minmax(0,1fr)] place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] max-sm:place-items-end max-sm:p-0 print:hidden"
      >
        <div className="relative w-full max-w-[560px]" onClick={(e) => e.stopPropagation()}>
          <div className="max-h-[calc(100dvh-32px)] overflow-x-hidden overflow-y-auto rounded-[16px] bg-paper px-[18px] pt-[16px] pb-[16px] text-ink shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-hred)] max-sm:max-h-[calc(100dvh-24px)] max-sm:rounded-b-none max-sm:px-[16px] max-sm:shadow-[0_-8px_30px_rgba(0,0,0,0.35),inset_0_3px_0_var(--color-hred)]">
            <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[10px] pr-[18px] max-sm:pr-[40px]">
              <div className="font-serif text-[20px] font-black text-hred">
                Score calculator{" "}
                <span lang="ko" className="text-[15px] font-medium whitespace-nowrap text-muted">
                  점수 계산
                </span>
              </div>
              <Segmented
                value={players}
                onChange={(v) => setPlayers(v)}
                options={[
                  [3, "3 players"],
                  [2, "2 players"],
                ]}
              />
            </div>

            <Section title="Winner's cards" note="what the player who called Stop captured">
              <CardRow label="Gwang" ko="광" value={hand.gwang} max={5} onChange={(v) => set("gwang", v)}>
                {hand.gwang === 3 && (
                  <Toggle on={hand.rainMan} onChange={(v) => set("rainMan", v)}>
                    incl. Rain Man
                  </Toggle>
                )}
              </CardRow>
              <CardRow label="Animals" ko="열끗" value={hand.animals} max={9} onChange={(v) => set("animals", v)}>
                <Toggle on={hand.godori} onChange={(v) => set("godori", v)}>
                  Godori
                </Toggle>
              </CardRow>
              <CardRow label="Ribbons" ko="띠" value={hand.ribbons} max={10} onChange={(v) => set("ribbons", v)}>
                <Toggle on={hand.hongdan} onChange={(v) => set("hongdan", v)}>
                  Hongdan
                </Toggle>
                <Toggle on={hand.cheongdan} onChange={(v) => set("cheongdan", v)}>
                  Cheongdan
                </Toggle>
                <Toggle on={hand.chodan} onChange={(v) => set("chodan", v)}>
                  Chodan
                </Toggle>
              </CardRow>
              <CardRow
                label="Junk"
                ko="피"
                hint="double junk = 2"
                value={hand.junk}
                max={30}
                onChange={(v) => set("junk", v)}
              />
            </Section>

            <Section title="Bonuses">
              <CardRow label="Go" ko="고" hint="times called" value={goes} max={5} onChange={setGoes} stepperLabel="Go called">
                <Effect>{goes ? (goEffect(goes).add ? `+${goEffect(goes).add} pt${goes > 1 ? "s" : ""}` : `×${goEffect(goes).mult}`) : "+1, +2, then ×2, ×4, ×8"}</Effect>
              </CardRow>
              <CardRow label="Shake / Bomb" ko="흔들기 / 폭탄" value={shakes} max={3} onChange={setShakes} stepperLabel="Shakes and Bombs">
                <Effect>{shakes ? `×${2 ** shakes}` : "×2 each"}</Effect>
              </CardRow>
              <div className="flex items-center gap-x-[10px] py-[4px]">
                <div className="w-[100px] flex-none leading-tight">
                  <span className="text-[14px] font-bold">Nagari</span>{" "}
                  <span lang="ko" className="font-serif text-[13px] font-bold text-hred">
                    나가리
                  </span>
                </div>
                <Toggle on={afterNagari} onChange={setAfterNagari}>
                  Last hand was a draw ×2
                </Toggle>
              </div>
            </Section>

            <Section title="Losers">
              <div className={`grid gap-[8px] ${players === 3 ? "sm:grid-cols-2" : ""}`}>
                {opponents.map((l, i) => (
                  <div key={i} className="rounded-[10px] bg-card px-[8px] py-[8px] shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
                    <div className="mb-[6px] text-[12px] font-bold tracking-[0.05em] text-[#7a5418] uppercase">{names[i]}</div>
                    <div className="flex flex-nowrap gap-[4px]">
                      <Toggle
                        compact
                        on={l.piBak}
                        onChange={(v) => setLoser(i, "piBak", v)}
                        disabled={!r.scoredWithJunk}
                        tipAlign="left"
                        tip={
                          r.scoredWithJunk
                            ? "Has fewer than 6 junk: pays ×2"
                            : "Only when the winner scored with junk (10+ junk)"
                        }
                      >
                        Pi-bak
                      </Toggle>
                      <Toggle
                        compact
                        on={l.gwangBak}
                        onChange={(v) => setLoser(i, "gwangBak", v)}
                        disabled={!r.scoredWithGwang}
                        tip={
                          r.scoredWithGwang
                            ? "Captured no gwang at all: pays ×2"
                            : "Only when the winner scored with gwang (3+ gwang)"
                        }
                      >
                        Gwang-bak
                      </Toggle>
                      {players === 3 && (
                        <Toggle
                          compact
                          on={l.goBak}
                          onChange={(v) => setLoser(i, "goBak", v)}
                          tipAlign="right"
                          tip="Called Go earlier, then someone else won: pays everyone's share"
                        >
                          Go-bak
                        </Toggle>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* result */}
            {/* pinned to the bottom while scrolling (on phones the inputs are taller than the screen) */}
            <div
              className="sticky -bottom-[16px] z-10 -mx-[18px] mt-[14px] bg-paper px-[18px] pt-[2px] pb-[16px] max-sm:-mx-[16px] max-sm:px-[16px] max-sm:pb-[12px] shadow-[0_-10px_14px_-10px_rgba(0,0,0,0.25)] sm:static sm:mx-0 sm:p-0 sm:shadow-none"
              aria-live="polite"
            >
              <div className="overflow-hidden rounded-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.18),inset_0_0_0_1.5px_var(--color-gold)]">
                {/* score band */}
                <div className="flex items-center gap-[14px] bg-[linear-gradient(135deg,var(--color-hred),#a50d27_55%,#8e0b22)] px-[14px] py-[12px] text-white max-sm:gap-[10px] max-sm:py-[8px]">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] font-bold tracking-[0.12em] text-[#fff3dc] uppercase">Winner&rsquo;s score</div>
                    {/* the full breakdown; on phones just a one-line status to keep the pinned bar short */}
                    <div className="mt-[6px] flex flex-wrap gap-[5px] max-sm:hidden">
                      {r.lines.length ? (
                        r.lines.map((l) => (
                          <span
                            key={l.label}
                            className="rounded-full bg-paper/95 px-[8px] py-[2px] text-[12px] font-semibold whitespace-nowrap text-ink"
                          >
                            {l.label} <b className="text-hred">{l.pts}</b>
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] text-white">Add the winner&rsquo;s cards above</span>
                      )}
                      {r.steps.slice(1).map((step) => (
                        <span
                          key={step}
                          className="rounded-full bg-gold px-[8px] py-[2px] text-[12px] font-bold whitespace-nowrap text-[#5c1a00]"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                    {r.cardTotal < target && (
                      <div className="mt-[6px] text-[12px] font-semibold text-white max-sm:hidden">
                        Below the {target}-point target: can&rsquo;t call Stop yet.
                      </div>
                    )}
                    <div className="mt-[2px] text-[13px] leading-snug font-semibold text-white sm:hidden">
                      {!r.lines.length
                        ? "Add the winner's cards"
                        : r.cardTotal < target
                          ? `Below the ${target}-point target`
                          : `${r.cardTotal} card pts${r.steps.length > 1 ? ` · ${r.steps.length - 1} bonus${r.steps.length > 2 ? "es" : ""}` : ""}`}
                    </div>
                  </div>
                  {/* gold medallion; keyed so it pops when the score changes */}
                  <div
                    key={r.score}
                    className="deal-in grid size-[76px] flex-none place-items-center rounded-full max-sm:size-[56px] bg-[radial-gradient(circle_at_35%_30%,#ffe089,var(--color-gold)_60%,#e2a520)] shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_0_0_3px_rgba(255,255,255,0.45)]"
                  >
                    <div className="text-center leading-none">
                      <div className="font-serif text-[32px] font-black text-[#7d0b1a] tabular-nums max-sm:text-[24px]">{r.score}</div>
                      <div className="text-[10px] font-bold tracking-[0.1em] text-[#5c0a14] uppercase">pts</div>
                    </div>
                  </div>
                </div>

                {/* who pays whom */}
                <div
                  className="grid gap-[8px] bg-[#f1e6d2] p-[10px] max-sm:gap-[6px] max-sm:p-[8px]"
                  style={{ gridTemplateColumns: `repeat(${opponents.length + 1}, minmax(0, 1fr))` }}
                >
                  {opponents.map((_, i) => (
                    <PayCard key={i} name={names[i]} amount={-r.pays[i]} notes={r.payNotes[i]} />
                  ))}
                  <PayCard name="Winner" amount={r.pays.reduce((n, p) => n + p, 0)} winner />
                </div>
              </div>
            </div>

            <div className="mt-[10px] flex justify-end">
              <button
                type="button"
                onClick={reset}
                className="cursor-pointer rounded-full border-[1.5px] border-rule bg-card px-[12px] py-[5px] text-[13px] font-bold text-ink hover:border-gold"
              >
                Reset
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute -top-[14px] -right-[14px] grid size-[36px] cursor-pointer max-sm:top-[12px] max-sm:right-[12px] max-sm:size-[32px] place-items-center rounded-full bg-hred text-white shadow-[0_4px_12px_rgba(0,0,0,0.35),0_0_0_3px_var(--color-paper)] transition-transform hover:scale-110"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </ViewportOverlay>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-[12px]">
      <h3 className="mb-[6px] flex items-baseline gap-[6px] border-b-[1px] border-rule pb-[3px]">
        <span className="font-serif text-[15px] font-black text-hred">{title}</span>
        {note && <span className="text-[12px] text-muted max-sm:hidden">{note}</span>}
      </h3>
      {children}
    </section>
  );
}

function CardRow({
  label,
  ko,
  hint,
  value,
  max,
  onChange,
  stepperLabel = label,
  children,
}: {
  label: string;
  ko?: string;
  hint?: string;
  /** Accessible name for the stepper, if different from the label. */
  stepperLabel?: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] py-[4px]">
      <div className="w-[100px] flex-none leading-tight">
        <span className="text-[14px] font-bold">{label}</span>
        {ko && (
          <>
            {" "}
            <span lang="ko" className="font-serif text-[13px] font-bold text-hred">
              {ko}
            </span>
          </>
        )}
        {hint && <div className="text-[11px] text-muted">{hint}</div>}
      </div>
      <Stepper value={value} max={max} onChange={onChange} label={stepperLabel} />
      {children && <div className="flex flex-wrap items-center gap-[6px] max-sm:basis-full">{children}</div>}
    </div>
  );
}

/** What a bonus does to the score, next to its stepper. */
function Effect({ children }: { children: ReactNode }) {
  return <span className="text-[12.5px] font-semibold text-muted">{children}</span>;
}

function Stepper({ value, max, onChange, label }: { value: number; max: number; onChange: (v: number) => void; label: string }) {
  const btn =
    "grid size-[28px] cursor-pointer place-items-center rounded-full text-[17px] leading-none font-bold disabled:cursor-default disabled:opacity-35";
  return (
    <div className="flex items-center gap-[4px]" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className={`${btn} border-[1.5px] border-rule bg-card text-ink`}
      >
        −
      </button>
      <span className="w-[26px] text-center text-[17px] font-black tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`${btn} bg-hred text-white`}
      >
        +
      </button>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  disabled = false,
  compact = false,
  tip,
  tipAlign = "center",
  children,
}: {
  on: boolean;
  /** Tighter, for a row of chips that must stay on one line. */
  compact?: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** Hover / focus tooltip explaining the toggle (shown even when it's disabled, to say why). */
  tip?: string;
  /** Which edge the tooltip lines up with, so chips near the dialog's edges don't get theirs cut off. */
  tipAlign?: "left" | "center" | "right";
  children: ReactNode;
}) {
  const active = on && !disabled;
  const tipId = useId();
  const button = (
    <button
      type="button"
      aria-pressed={active}
      aria-describedby={tip ? tipId : undefined}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`cursor-pointer rounded-full border-[1.5px] py-[3px] font-semibold whitespace-nowrap ${
        compact ? "px-[7px] text-[11.5px]" : "px-[10px] text-[12.5px]"
      } transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-hred bg-hred text-white" : "border-rule bg-card text-ink hover:border-gold"
      }`}
    >
      {active ? "✓ " : ""}
      {children}
    </button>
  );
  if (!tip) return button;
  const align = { left: "left-0", center: "left-1/2 -translate-x-1/2", right: "right-0" }[tipAlign];
  return (
    // the wrapper takes the hover, since a disabled button gets no mouse events in some browsers
    <span className="group relative inline-flex">
      {button}
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-20 mb-[6px] w-max max-w-[210px] rounded-[8px] bg-ink px-[9px] py-[5px] text-[12px] leading-snug font-semibold text-white opacity-0 shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 ${align}`}
      >
        {tip}
      </span>
    </span>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex rounded-full bg-[#efe6d6] p-[3px]" role="radiogroup">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`cursor-pointer rounded-full px-[12px] py-[4px] text-[13px] font-bold ${
            value === v ? "bg-hred text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" : "text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PayCard({ name, amount, notes = [], winner = false }: { name: string; amount: number; notes?: string[]; winner?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center rounded-[10px] px-[6px] pt-[7px] pb-[8px] text-center shadow-[0_2px_6px_rgba(0,0,0,0.12)] max-sm:pt-[4px] max-sm:pb-[5px] ${
        winner ? "bg-gold-soft ring-[2px] ring-gold" : "bg-card"
      }`}
    >
      <div className="text-[11px] font-bold tracking-[0.06em] text-[#7a5418] uppercase">{name}</div>
      <div
        key={amount}
        className={`deal-in font-serif text-[26px] leading-[1.1] font-black tabular-nums max-sm:text-[21px] ${
          amount > 0 ? "text-hgreen" : amount < 0 ? "text-hred" : "text-muted"
        }`}
      >
        {amount > 0 ? `+${amount}` : amount < 0 ? `−${-amount}` : "0"}
      </div>
      <div className="text-[11px] leading-tight text-muted max-sm:text-[10.5px]">
        {notes.length ? notes.join(", ") : winner ? "collects" : "pays"}
      </div>
    </div>
  );
}
