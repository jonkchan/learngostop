"use client";

import { useEffect, useState, type ReactNode } from "react";
import { goStopScenarios, type Player } from "@/lib/goStopDemos";
import { AutoplaySwitch, CtrlButton, readAutoplay, writeAutoplay } from "./PlayDemo";
import { ViewportOverlay } from "./ViewportOverlay";

/**
 * Makes the GO / STOP boxes clickable: opens a demo that plays out every way the decision can go.
 * Screen only: in print it's the plain boxes (the ▶ hint is hidden).
 */
export function GoStopDemoTrigger({ className, children }: { className: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* clickable with a mouse; keyboard and screen readers use the ▶ button, so the boxes stay readable */}
      <div
        data-tour="gostop"
        title="See every Go / Stop scenario"
        onClick={() => setOpen(true)}
        className={`${className} group relative cursor-pointer rounded-[5pt] transition-shadow hover:shadow-[0_0_0_1.5pt_var(--color-gold),0_6pt_14pt_rgba(0,0,0,0.18)] has-[.open-btn:focus-visible]:outline-[1.5pt] has-[.open-btn:focus-visible]:outline-gold print:shadow-none`}
      >
        {children}
        <button
          type="button"
          aria-label="Show every way Go or Stop can play out"
          className="open-btn absolute top-[4pt] -left-[11pt] grid select-none size-[9pt] cursor-pointer place-items-center rounded-full bg-hred text-white opacity-70 outline-none transition-opacity group-hover:opacity-100! focus-visible:opacity-100! [@media(hover:hover)]:opacity-0 print:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 10 10" className="ml-[0.5pt] size-[4.5pt]" fill="currentColor">
            <path d="M2 1l7 4-7 4z" />
          </svg>
        </button>
      </div>
      {open && (
        <ViewportOverlay>
          <GoStopDialog onClose={() => setOpen(false)} />
        </ViewportOverlay>
      )}
    </>
  );
}

/**
 * A row of the "Watch out" list (Go-bak, Nagari) that opens the Go/Stop demo on that scenario.
 * Like the Special Plays rows: the whole row is clickable with a mouse, the ▶ button (in the column gutter,
 * lined up with the Go/Stop boxes' ▶) handles keyboard and screen readers, and it sits inside the <dt>
 * so the <dl> stays valid. Screen only.
 */
export function GoStopRow({
  scenario,
  label,
  termClassName,
  term,
  def,
  className = "col-span-2 -mx-[3pt] grid grid-cols-subgrid rounded-[2pt] px-[3pt] hover:bg-[#f9dcd8]",
  hintPos = "-left-[16.5pt]",
}: {
  /** A goStopScenarios key, e.g. "gobak". */
  scenario: string;
  label: string;
  termClassName: string;
  term: ReactNode;
  def: ReactNode;
  /** Row layout and hover color (defaults suit the Watch out box). */
  className?: string;
  /** Left offset of the ▶, so it lands in the column gutter. */
  hintPos?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        title="Watch how it plays out"
        onClick={() => setOpen(true)}
        className={`${className} group relative cursor-pointer transition-colors has-[.open-btn:focus-visible]:outline-[1.5pt] has-[.open-btn:focus-visible]:outline-gold print:bg-transparent`}
      >
        <dt className={termClassName}>
          <button
            type="button"
            aria-label={label}
            className={`open-btn absolute top-[1pt] ${hintPos} grid size-[9pt] cursor-pointer select-none place-items-center rounded-full bg-hred text-white opacity-70 outline-none transition-opacity group-hover:opacity-100! focus-visible:opacity-100! [@media(hover:hover)]:opacity-0 print:hidden`}
          >
            <svg aria-hidden="true" viewBox="0 0 10 10" className="ml-[0.5pt] size-[4.5pt]" fill="currentColor">
              <path d="M2 1l7 4-7 4z" />
            </svg>
          </button>
          {term}
        </dt>
        <dd>{def}</dd>
      </div>
      {open && (
        <ViewportOverlay>
          <GoStopDialog initialKey={scenario} only onClose={() => setOpen(false)} />
        </ViewportOverlay>
      )}
    </>
  );
}

const players: { id: Player; name: string }[] = [
  { id: "you", name: "You" },
  { id: "b", name: "Player B" },
  { id: "c", name: "Player C" },
];

function GoStopDialog({
  onClose,
  initialKey,
  only = false,
}: {
  onClose: () => void;
  /** Scenario to open on; its group (Go/Stop endings or penalties) decides which tabs show. */
  initialKey?: string;
  /** Opened for one scenario (from a Watch out row): autoplay stops at its end instead of moving on. */
  only?: boolean;
}) {
  const group = goStopScenarios.find((s) => s.key === initialKey)?.group ?? "gostop";
  const list = goStopScenarios.filter((s) => s.group === group);
  const [scenario, setScenario] = useState(() => Math.max(0, list.findIndex((s) => s.key === initialKey)));
  const [frame, setFrame] = useState(0);
  const [autoplay, setAutoplay] = useState(readAutoplay);
  const sc = list[scenario];
  const last = sc.frames.length - 1;
  const f = sc.frames[frame];

  // auto-advance; at the end of a scenario, pause a beat and move on to the next one
  const running = autoplay && (frame < last || (!only && scenario < list.length - 1));
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(
      () => {
        if (frame < last) setFrame(frame + 1);
        else {
          setScenario((s) => s + 1);
          setFrame(0);
        }
      },
      frame < last ? 2100 : 3200,
    );
    return () => clearTimeout(t);
  }, [frame, last, running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setFrame((x) => Math.min(last, x + 1));
      else if (e.key === "ArrowLeft") setFrame((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, last]);

  const pick = (i: number) => {
    setScenario(i);
    setFrame(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={group === "penalty" ? "Penalties for losers" : "Go or Stop: every scenario"}
      onClick={onClose}
      className="absolute inset-0 grid grid-cols-[minmax(0,1fr)] place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] print:hidden"
    >
      <div className="relative w-full max-w-[680px]" onClick={(e) => e.stopPropagation()}>
        <div className="max-h-[calc(100dvh-32px)] overflow-x-hidden overflow-y-auto rounded-[16px] bg-paper px-[18px] pt-[16px] pb-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-hred)]">
          <div className="mb-[10px] flex items-center justify-between gap-[12px] pr-[18px]">
            <div className="font-serif text-[20px] font-black text-hred">
              {group === "penalty" ? "Penalties" : "Go or Stop?"}{" "}
              <span lang="ko" className="text-[15px] font-medium whitespace-nowrap text-muted">
                {group === "penalty" ? "박" : "고 / 스톱"}
              </span>
            </div>
            <AutoplaySwitch
              on={autoplay}
              onChange={(on) => {
                setAutoplay(on);
                writeAutoplay(on);
              }}
            />
          </div>

          {/* scenario tabs */}
          <div className="-mx-[2px] mb-[12px] flex flex-wrap gap-[6px] px-[2px] pb-[2px]" role="tablist">
            {list.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === scenario}
                onClick={() => pick(i)}
                className={`flex-none cursor-pointer rounded-full border-[1.5px] px-[11px] py-[4px] text-[13px] max-sm:px-[9px] max-sm:text-[12px] font-semibold whitespace-nowrap transition-colors ${
                  i === scenario
                    ? "border-hred bg-hred text-white"
                    : "border-rule bg-card text-ink hover:border-gold hover:bg-gold-soft"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* the table: three players */}
          <div className="relative rounded-[12px] bg-[#f1e6d2] p-[12px] shadow-[inset_0_0_0_1.5px_var(--color-gold)]">
            <div className="grid grid-cols-3 gap-[8px]">
              {players.map((p) => {
                const calledHere = f.call?.who === p.id ? f.call.what : null;
                const paid = f.pay?.[p.id];
                return (
                  <div
                    key={p.id}
                    className={`relative flex flex-col items-center rounded-[10px] bg-card px-[6px] pt-[10px] pb-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.12)] ${
                      f.flag?.includes(p.id) ? "ring-[2.5px] ring-hred" : p.id === "you" ? "ring-[2px] ring-gold" : ""
                    }`}
                  >
                    <div className="text-[12px] font-bold tracking-[0.05em] text-[#7a5418] uppercase">{p.name}</div>
                    <div
                      key={f.points[p.id]}
                      className="deal-in font-serif text-[clamp(30px,8vw,44px)] leading-none font-black text-ink tabular-nums"
                    >
                      {f.points[p.id]}
                    </div>
                    <div className="text-[11px] text-muted">points</div>
                    {f.notes?.[p.id] && (
                      <div
                        className={`mt-[4px] rounded-full px-[7px] text-[11px] leading-[18px] font-bold ${
                          f.flag?.includes(p.id) ? "bg-hred-soft text-hred" : "bg-[#efe6d6] text-ink"
                        }`}
                      >
                        {f.notes[p.id]}
                      </div>
                    )}
                    {/* your Go badges */}
                    {p.id === "you" && (
                      <div className="mt-[6px] flex h-[20px] gap-[4px]">
                        {Array.from({ length: f.goes }, (_, i) => (
                          <span
                            key={i}
                            className="deal-in rounded-[4px] border-[1.5px] border-hred bg-hred-soft px-[5px] text-[10px] leading-[17px] font-black tracking-[0.04em] text-hred"
                          >
                            GO {i + 1}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* GO / STOP stamp */}
                    {calledHere && (
                      <span
                        key={`${scenario}-${frame}`}
                        className={`deal-in absolute -top-[10px] -right-[6px] rotate-[8deg] rounded-[6px] px-[8px] py-[2px] font-serif text-[16px] font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.3),inset_0_0_0_2px_var(--color-gold)] ${
                          calledHere === "GO" ? "bg-hred" : "bg-ink"
                        }`}
                      >
                        {calledHere}
                      </span>
                    )}
                    {/* settlement */}
                    {paid !== undefined && (
                      <span
                        className={`deal-in mt-[8px] rounded-full px-[10px] py-[2px] text-[14px] font-black tabular-nums ${
                          paid > 0 ? "bg-hgreen text-white" : paid < 0 ? "bg-hred text-white" : "bg-[#cfc4b2] text-ink"
                        }`}
                      >
                        {paid > 0 ? `+${paid}` : paid < 0 ? `−${-paid}` : "0"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {f.ending && (
              <div className="deal-in mt-[10px] text-center font-serif text-[18px] font-black text-hred">{f.ending}</div>
            )}
          </div>

          {/* caption + controls */}
          <div className="mt-[12px] flex items-center gap-[10px] max-sm:flex-col max-sm:items-stretch">
            <p className="min-h-[44px] flex-1 text-[15px] max-sm:min-h-[62px] leading-snug text-ink" aria-live="polite">
              {f.caption}
              {/* the payout chips are visual; spell them out for screen readers */}
              {f.pay && (
                <span className="sr-only">
                  {" "}
                  Payout:{" "}
                  {players
                    .map((p) => {
                      const n = f.pay![p.id];
                      const s = p.id === "you" ? "" : "s"; // "you pay" / "Player B pays"
                      return `${p.name} ${n > 0 ? `receive${s} ${n}` : n < 0 ? `pay${s} ${-n}` : `pay${s} nothing`}`;
                    })
                    .join(", ")}
                  .
                </span>
              )}
            </p>
            <div className="flex flex-none items-center gap-[6px] max-sm:justify-end">
              <CtrlButton label="Previous step" onClick={() => setFrame((x) => Math.max(0, x - 1))} icon="M15 6l-6 6 6 6" />
              <span className="w-[38px] text-center text-[12px] text-muted tabular-nums">
                {frame + 1}/{last + 1}
              </span>
              <CtrlButton label="Next step" onClick={() => setFrame((x) => Math.min(last, x + 1))} icon="M9 6l6 6-6 6" />
              <CtrlButton label="Replay" onClick={() => setFrame(0)} icon="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-[14px] -right-[14px] grid size-[36px] cursor-pointer place-items-center rounded-full bg-hred text-white shadow-[0_4px_12px_rgba(0,0,0,0.35),0_0_0_3px_var(--color-paper)] transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
