"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { demos, type Demo, type Place } from "@/lib/playDemos";
import { ViewportOverlay } from "./ViewportOverlay";

/**
 * A Special Plays row that opens an animated demo of that play when clicked.
 * Screen only: in print it's a plain row (the ▶ hint is hidden).
 */
export function PlayDemoRow({
  play,
  className,
  termClassName,
  term,
  def,
}: {
  play: string;
  className: string;
  termClassName: string;
  term: ReactNode;
  def: ReactNode;
}) {
  const demo = demos[play];
  const [open, setOpen] = useState(false);
  if (!demo)
    return (
      <div className={className}>
        <dt className={termClassName}>{term}</dt>
        <dd>{def}</dd>
      </div>
    );
  return (
    <>
      {/* the whole row is clickable with a mouse; keyboard and screen readers use the ▶ button,
          so the term and definition stay readable as a list */}
      <div
        title="Watch how it works"
        onClick={() => setOpen(true)}
        className={`${className} group relative cursor-pointer transition-colors hover:bg-gold-soft has-[.open-btn:focus-visible]:outline-[1.5pt] has-[.open-btn:focus-visible]:outline-gold print:bg-transparent`}
      >
        <dt className={termClassName}>
          {/* small "watch" hint in the left margin, screen only, so it never covers the text.
              It lives in the <dt> (a row <div> in a <dl> may only hold dt/dd); it's positioned against the row. */}
          <button
            type="button"
            aria-label={`Show how ${play} works`}
            className="open-btn absolute top-[2pt] -left-[11pt] grid select-none size-[9pt] cursor-pointer place-items-center rounded-full bg-hred text-white opacity-70 outline-none transition-opacity group-hover:opacity-100 focus-visible:opacity-100 print:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 10 10"
              className="ml-[0.5pt] size-[4.5pt]"
              fill="currentColor"
            >
              <path d="M2 1l7 4-7 4z" />
            </svg>
          </button>
          {term}
        </dt>
        <dd>{def}</dd>
      </div>
      {open && (
        <ViewportOverlay>
          <DemoDialog demo={demo} onClose={() => setOpen(false)} />
        </ViewportOverlay>
      )}
    </>
  );
}

/** A small labeled "▶ Watch" chip that opens a demo (e.g. in the Your Turn heading). Screen only. */
export function DemoChip({
  play,
  label,
  ariaLabel,
  tour,
}: {
  play: string;
  label: string;
  /** Fuller name for screen readers; should start with the visible label. */
  ariaLabel?: string;
  tour?: string;
}) {
  const demo = demos[play];
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-tour={tour}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-[3pt] rounded-full bg-hred select-none py-[2.5pt] pr-[6pt] pl-[5pt] font-sans text-[7pt] leading-none font-bold tracking-[0.02em] text-white opacity-85 transition-opacity hover:opacity-100 focus-visible:outline-[1.5pt] focus-visible:outline-offset-[1pt] focus-visible:outline-gold print:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 10 10" className="block size-[5pt] flex-none" fill="currentColor">
          <path d="M2 1l7 4-7 4z" />
        </svg>
        {/* trimmed to the capital height so the word centers on the ▶ (same trick as the step numbers) */}
        <span className="[text-box:trim-both_cap_alphabetic]">{label}</span>
      </button>
      {open && (
        <ViewportOverlay>
          <DemoDialog demo={demo} onClose={() => setOpen(false)} />
        </ViewportOverlay>
      )}
    </>
  );
}

/* ---------- the mini table ---------- */

/** Stage is 600 × 330 units; everything is placed in percentages so it scales to any width. */
const W = 600;
const H = 330;
const CARD_W = 50;
const CARD_H = 82;

function position(p: Place): { x: number; y: number; z: number } {
  const stack = p.stack ?? 0;
  switch (p.zone) {
    case "opp":
      return { x: 24 + p.slot * 34, y: 26, z: 5 + p.slot };
    case "table":
      return {
        x: 70 + p.slot * 100 + stack * 12,
        y: 122 - stack * 4 - (p.lift ? 6 : 0),
        z: 10 + stack,
      };
    case "pile":
      return { x: 506, y: p.lift ? 108 : 122, z: p.lift ? 60 : 20 };
    case "hand":
      return { x: 24 + p.slot * 58, y: p.raised ? 222 : 238, z: 30 + p.slot };
    case "mine":
      return { x: 440 + p.slot * 18, y: 238, z: 40 + p.slot };
  }
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function DemoDialog({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  const [frame, setFrame] = useState(0);
  const [autoplay, setAutoplay] = useState(readAutoplay);
  const last = demo.frames.length - 1;

  // auto-advance until the last frame
  const running = autoplay && frame < last;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setFrame((f) => f + 1), 1900);
    return () => clearTimeout(t);
  }, [frame, running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setFrame((f) => Math.min(last, f + 1));
      else if (e.key === "ArrowLeft") setFrame((f) => Math.max(0, f - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, last]);

  // every card that appears in any frame, with where it is now (or where it last was, if hidden)
  const cards = useMemo(() => {
    const ids = [...new Set(demo.frames.flatMap((f) => Object.keys(f.at)))];
    return ids.map((id) => {
      let place: Place | undefined;
      let visible = false;
      for (let i = 0; i <= frame; i++) {
        const p = demo.frames[i].at[id];
        if (p) place = p;
        if (i === frame) visible = !!p;
      }
      // a card that hasn't appeared yet waits (hidden) where it will first show up
      place ??= demo.frames.find((f) => f.at[id])!.at[id];
      return { id, place, visible };
    });
  }, [demo, frame]);

  const { badge, caption } = demo.frames[frame];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={demo.title}
      onClick={onClose}
      className="absolute inset-0 grid place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] print:hidden"
    >
      <div
        className="relative w-full max-w-[680px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[16px] bg-paper px-[18px] pt-[16px] pb-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-hred)]">
          <div className="mb-[10px] flex items-center justify-between gap-[12px] pr-[18px]">
            <div className="font-serif text-[20px] font-black text-hred">
              {demo.title}
            </div>
            <AutoplaySwitch
              on={autoplay}
              onChange={(on) => {
                setAutoplay(on);
                writeAutoplay(on);
              }}
            />
          </div>

          {/* the felt table */}
          <div
            className="relative w-full overflow-hidden rounded-[12px] bg-[#f1e6d2] shadow-[inset_0_0_0_1.5px_var(--color-gold)]"
            style={{ aspectRatio: `${W} / ${H}` }}
          >
            <ZoneLabel x={24} y={8} text="Opponents" />
            <ZoneLabel x={70} y={92} text="Table" />
            <ZoneLabel x={506} y={92} text="Pile" />
            <ZoneLabel x={24} y={220} text="Your hand" />
            <ZoneLabel x={440} y={220} text="Your captures" />
            <div
              className="absolute border-t border-dashed border-[#d9c7a5]"
              style={{ left: "3%", right: "3%", top: pct(208, H) }}
            />

            {cards.map(({ id, place, visible }) => {
              const { x, y, z } = position(place);
              return (
                <div
                  key={id}
                  className="absolute transition-[left,top,opacity,translate] duration-[650ms] ease-[cubic-bezier(0.3,0.9,0.3,1)] motion-reduce:transition-none"
                  style={{
                    left: pct(x, W),
                    top: pct(y, H),
                    width: pct(CARD_W, W),
                    height: pct(CARD_H, H),
                    zIndex: z,
                    opacity: visible ? 1 : 0,
                  }}
                >
                  <DemoCard
                    id={id}
                    faceDown={!!place.faceDown}
                    glow={!!place.lift}
                  />
                </div>
              );
            })}

            {badge && (
              <div className="pointer-events-none absolute inset-0 z-[90] grid place-items-center">
                <span className="deal-in rounded-[14px] bg-hred px-[18px] py-[6px] font-serif text-[clamp(28px,7vw,48px)] font-black text-gold shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_0_0_3px_var(--color-gold)]">
                  {badge}
                </span>
              </div>
            )}
          </div>

          {/* caption + controls */}
          <div className="mt-[12px] flex items-center gap-[10px]">
            <p
              className="min-h-[44px] flex-1 text-[15px] leading-snug text-ink"
              aria-live="polite"
            >
              {caption}
            </p>
            <div className="flex flex-none items-center gap-[6px]">
              <CtrlButton
                label="Previous step"
                onClick={() => setFrame((f) => Math.max(0, f - 1))}
                icon="M15 6l-6 6 6 6"
              />
              <span className="w-[38px] text-center text-[12px] text-muted tabular-nums">
                {frame + 1}/{last + 1}
              </span>
              <CtrlButton
                label="Next step"
                onClick={() => setFrame((f) => Math.min(last, f + 1))}
                icon="M9 6l6 6-6 6"
              />
              <CtrlButton
                label="Replay"
                onClick={() => setFrame(0)}
                icon="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-[14px] -right-[14px] grid size-[36px] cursor-pointer place-items-center rounded-full bg-hred text-white shadow-[0_4px_12px_rgba(0,0,0,0.35),0_0_0_3px_var(--color-paper)] transition-transform hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ZoneLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <span
      className="absolute text-[clamp(9px,1.9vw,11px)] font-bold tracking-[0.06em] text-[#7a5418] uppercase"
      style={{ left: pct(x, W), top: pct(y, H) }}
    >
      {text}
    </span>
  );
}

/** A card face (real art) and a red hwatu back that cross-fade when flipped. */
function DemoCard({
  id,
  faceDown,
  glow,
}: {
  id: string;
  faceDown: boolean;
  glow: boolean;
}) {
  return (
    <div
      className={`relative size-full rounded-[4px] transition-shadow duration-300 ${
        glow
          ? "shadow-[0_0_0_2px_var(--color-gold),0_6px_14px_rgba(0,0,0,0.35)]"
          : "shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVGs, animated by position */}
      <img
        src={`/cards/${id}.svg`}
        alt=""
        draggable={false}
        className={`absolute inset-0 size-full transition-opacity duration-300 ${faceDown ? "opacity-0" : "opacity-100"}`}
      />
      <div
        className={`absolute inset-0 rounded-[4px] bg-[#b3122a] shadow-[inset_0_0_0_2px_#fff,inset_0_0_0_4px_#b3122a,inset_0_0_0_5px_#f2b822] transition-opacity duration-300 ${
          faceDown ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function CtrlButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-[34px] cursor-pointer place-items-center rounded-full border-[1.5px] border-rule bg-card text-ink transition-colors hover:border-gold hover:bg-gold-soft"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[16px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={icon} />
      </svg>
    </button>
  );
}

/* ---------- autoplay preference (remembered in this browser) ---------- */

const AUTOPLAY_KEY = "learngostop:demo-autoplay";

export function readAutoplay(): boolean {
  try {
    return localStorage.getItem(AUTOPLAY_KEY) !== "off";
  } catch {
    return true; // storage blocked (private mode etc.): default to on
  }
}

export function writeAutoplay(on: boolean) {
  try {
    localStorage.setItem(AUTOPLAY_KEY, on ? "on" : "off");
  } catch {
    // ignore: the switch still works for this visit
  }
}

export function AutoplaySwitch({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex flex-none cursor-pointer items-center gap-[8px] text-[13px] font-semibold text-muted"
    >
      Autoplay
      <span
        className={`relative h-[22px] w-[38px] rounded-full transition-colors ${on ? "bg-hred" : "bg-[#cfc4b2]"}`}
      >
        <span
          className={`absolute top-[3px] left-[3px] size-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform ${
            on ? "translate-x-[16px]" : ""
          }`}
        />
      </span>
    </button>
  );
}
