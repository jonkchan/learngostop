"use client";

import { useEffect, useState } from "react";
import { Blossom } from "./Sheet";
import { ViewportOverlay } from "./ViewportOverlay";

const SEEN_KEY = "learngostop:welcome-seen";
/** Dispatched on window (by the floating Tour button) to start the tour again. */
export const TOUR_EVENT = "learngostop:tour";

type Step = {
  /** CSS selector for the thing to spotlight; none for a centered closing card. */
  target?: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    target: "#month-grid > :first-child",
    title: "Tap a month",
    body: "See its four cards up close, with what each one is. Swipe or use the arrows to flip through all twelve.",
  },
  {
    target: '[data-tour="legend"]',
    title: "Find a set",
    body: "Tap a legend tile, like Godori or Hongdan, to light up the cards that make it. Tap again to clear.",
  },
  {
    target: '[data-tour="turn"]',
    title: "Watch a turn",
    body: "New to the game? Tap Watch to see three example turns play out, card by card.",
  },
  {
    target: '[data-tour="scoring"]',
    title: "Check what scores",
    body: "Tap any scoring row to highlight exactly which cards it needs on page 1.",
  },
  {
    target: '[data-tour="plays"]',
    title: "Watch the special plays",
    body: "Ppeok, Jjok, Ttadak… tap any of them to watch how it happens.",
  },
  {
    target: '[data-tour="gostop"]',
    title: "Go or Stop?",
    body: "Tap here to play out every way the big decision can end, from a safe Stop to a costly Go-bak.",
  },
  {
    title: "You're all set",
    body: "Print gives you an offline-friendly copy for the table: the same guide on exactly 2 pages, no screen needed. Or share the link with your players. The ? button in the corner brings this tour back anytime.",
  },
];

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // storage blocked (private mode etc.): the welcome just shows again next time
  }
}

/**
 * First visit: a welcome dialog offering a short spotlight tour of the page's interactive bits.
 * Remembered in localStorage; the floating Tour button (TOUR_EVENT) replays the tour. Screen only.
 */
export function WelcomeTour() {
  const [mode, setMode] = useState<"off" | "welcome" | "tour">("off");
  const [step, setStep] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    // a beat after load, so the page is there to look at behind the dialog
    const t = seen ? undefined : setTimeout(() => setMode("welcome"), 700);
    const replay = () => {
      setStep(0);
      setMode("tour");
    };
    window.addEventListener(TOUR_EVENT, replay);
    return () => {
      clearTimeout(t);
      window.removeEventListener(TOUR_EVENT, replay);
    };
  }, []);

  const close = () => {
    markSeen();
    setMode("off");
  };

  if (mode === "welcome")
    return (
      <ViewportOverlay>
        <Welcome
          onTour={() => {
            markSeen();
            setStep(0);
            setMode("tour");
          }}
          onSkip={close}
        />
      </ViewportOverlay>
    );
  if (mode === "tour")
    return (
      <ViewportOverlay>
        <TourStep index={step} onStep={setStep} onClose={close} />
      </ViewportOverlay>
    );
  return null;
}

function Welcome({ onTour, onSkip }: { onTour: () => void; onSkip: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onSkip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={onSkip}
      className="absolute inset-0 grid grid-cols-[minmax(0,1fr)] place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="deal-in relative w-full max-w-[420px] rounded-[16px] bg-paper px-[24px] pt-[24px] pb-[20px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-hred)]"
      >
        <CloseX label="Close" onClick={onSkip} />
        <Blossom className="mx-auto mb-[8px] size-[34px]" />
        <h2 id="welcome-title" className="font-serif text-[24px] leading-tight font-black text-ink">
          Welcome to Go-Stop{" "}
          <span lang="ko" className="whitespace-nowrap text-hred">
            고스톱
          </span>
        </h2>
        <p className="mt-[10px] text-[15px] leading-snug text-ink">
          A two-page cheat sheet for the Korean flower-card game. Print it for the table, or tap around: most of the
          page comes alive on screen.
        </p>
        <div className="mt-[20px] flex flex-col gap-[8px]">
          <button
            type="button"
            onClick={onTour}
            className="cursor-pointer rounded-full bg-hred px-[18px] py-[11px] text-[15px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition-transform hover:scale-[1.02]"
          >
            Show me around
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer rounded-full px-[18px] py-[9px] text-[14px] font-semibold text-muted hover:bg-black/5 hover:text-ink"
          >
            Skip, just let me read
          </button>
        </div>
      </div>
    </div>
  );
}

type Box = { x: number; y: number; w: number; h: number };

/**
 * One spotlight step: dims the page except around the target, with a card explaining it.
 * Coordinates are converted into ViewportOverlay's (unscaled) box so this still lines up when pinch-zoomed.
 */
function TourStep({ index, onStep, onClose }: { index: number; onStep: (i: number) => void; onClose: () => void }) {
  const step = steps[index];
  const last = index === steps.length - 1;
  const [box, setBox] = useState<Box | null>(null);
  /** Card at the top of the screen instead of the bottom. Decided once per step, so it doesn't jump while scrolling. */
  const [cardAtTop, setCardAtTop] = useState(false);

  useEffect(() => {
    const el = step.target ? document.querySelector(step.target) : null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let placed = 0;
    if (el) {
      // Scroll the target into the upper part of the screen, leaving the bottom for the card. Work out where it
      // will end up first (the page can't scroll past its end) and put the card at the top only if it would collide.
      const viewH = window.visualViewport?.height ?? window.innerHeight;
      const r = el.getBoundingClientRect();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const top = Math.min(maxScroll, Math.max(0, window.scrollY + r.top - viewH * 0.18));
      const finalBottom = r.bottom + window.scrollY - top;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      placed = requestAnimationFrame(() => setCardAtTop(finalBottom > viewH * 0.62));
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const scale = vv?.scale ?? 1;
        if (!el) return setBox(null);
        const r = el.getBoundingClientRect();
        const ox = vv?.offsetLeft ?? 0;
        const oy = vv?.offsetTop ?? 0;
        setBox({ x: (r.left - ox) * scale, y: (r.top - oy) * scale, w: r.width * scale, h: r.height * scale });
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(placed);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [step.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        if (last) onClose();
        else onStep(index + 1);
      }
      else if (e.key === "ArrowLeft" && index > 0) onStep(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, last, onStep, onClose]);

  const pad = 8;
  const hole = box && { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
  const dim = "absolute bg-black/60";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tour, step ${index + 1} of ${steps.length}: ${step.title}`}
      className="absolute inset-0 print:hidden"
    >
      {hole ? (
        <>
          {/* four plain panels around the hole (a giant box-shadow cutout renders unreliably) */}
          <div aria-hidden="true" className={dim} style={{ left: 0, top: 0, right: 0, height: Math.max(0, hole.y) }} />
          <div aria-hidden="true" className={dim} style={{ left: 0, top: hole.y + hole.h, right: 0, bottom: 0 }} />
          <div aria-hidden="true" className={dim} style={{ left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.h }} />
          <div aria-hidden="true" className={dim} style={{ left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h }} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-[6px] shadow-[0_0_0_3px_var(--color-gold),0_0_18px_rgba(242,184,34,0.55)]"
            style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }}
          />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
      )}

      <div
        key={index}
        className={`deal-in absolute left-1/2 w-[min(380px,calc(100%-32px))] -translate-x-1/2 rounded-[14px] bg-paper px-[20px] pt-[16px] pb-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_0_0_2.5px_var(--color-hred)] ${
          !box ? "top-1/2 -translate-y-1/2" : cardAtTop ? "top-[16px]" : "bottom-[16px]"
        }`}
      >
        <CloseX label="End tour" onClick={onClose} />
        <div className="flex items-center gap-[5px]" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-[5px] rounded-full transition-all ${i === index ? "w-[18px] bg-hred" : "w-[5px] bg-rule"}`}
            />
          ))}
          <span className="ml-auto text-[12px] text-muted tabular-nums">
            {index + 1} / {steps.length}
          </span>
        </div>
        <h2 className="mt-[8px] font-serif text-[19px] font-black text-hred">{step.title}</h2>
        <p className="mt-[4px] text-[15px] leading-snug text-ink">{step.body}</p>
        <div className="mt-[14px] flex items-center gap-[8px]">
          {!last && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full px-[10px] py-[7px] text-[13px] font-semibold text-muted hover:bg-black/5 hover:text-ink"
            >
              Skip tour
            </button>
          )}
          <div className="ml-auto flex gap-[8px]">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onStep(index - 1)}
                className="cursor-pointer rounded-full border-[1.5px] border-rule bg-card px-[14px] py-[7px] text-[14px] font-bold text-ink hover:border-gold"
              >
                Back
              </button>
            )}
            {/* autoFocus: each step remounts the card, so keep keyboard focus on the main action */}
            <button
              type="button"
              autoFocus={index > 0}
              onClick={() => (last ? onClose() : onStep(index + 1))}
              className="cursor-pointer rounded-full bg-hred px-[18px] py-[7px] text-[14px] font-bold text-white shadow-[0_3px_10px_rgba(0,0,0,0.2)]"
            >
              {last ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The red ✕ badge on the card's corner, same as the other dialogs. */
function CloseX({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute -top-[12px] -right-[12px] grid size-[32px] cursor-pointer place-items-center rounded-full bg-hred text-white shadow-[0_4px_12px_rgba(0,0,0,0.35),0_0_0_3px_var(--color-paper)] transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
