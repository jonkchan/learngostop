"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { describeCard, months } from "@/lib/deck";
import { ViewportOverlay } from "./ViewportOverlay";

/**
 * Wraps a month block: clicking it opens a large view of that month's four cards,
 * with arrows, ← → keys or a swipe to step through the months. Screen only.
 */
export function MonthZoom({
  num,
  className,
  style,
  children,
}: {
  num: number;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  /** +1 / -1 for the last step, so the cards slide in from that side; 0 when just opened. */
  const [dir, setDir] = useState(0);
  const step = useCallback((d: number) => {
    setDir(d);
    setOpen((n) => (n === null ? n : ((n - 1 + d + 12) % 12) + 1));
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      {/* clickable with a mouse; keyboard and screen readers get a hidden button, so the cards stay readable */}
      <div
        onClick={() => {
          setDir(0);
          setOpen(num);
        }}
        className={`${className} cursor-zoom-in transition-shadow duration-200 [box-shadow:var(--cap)] hover:[box-shadow:var(--cap),0_0_0_1.5pt_var(--color-gold),0_6pt_16pt_rgba(0,0,0,0.18)] has-[.open-btn:focus-visible]:outline-[1.5pt] has-[.open-btn:focus-visible]:outline-gold print:[box-shadow:var(--cap)]`}
        style={style}
      >
        {children}
        <button type="button" className="open-btn sr-only">
          Enlarge {months[num - 1].name} cards
        </button>
      </div>
      {open !== null && (
        <ViewportOverlay>
          <MonthDialog
            num={open}
            dir={dir}
            onClose={() => setOpen(null)}
            onStep={step}
          />
        </ViewportOverlay>
      )}
    </>
  );
}

function MonthDialog({
  num,
  dir,
  onClose,
  onStep,
}: {
  num: number;
  dir: number;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  const month = months[num - 1];

  // swipe left / right to change month (mostly-horizontal swipes only, so scrolling still works)
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
      onStep(dx < 0 ? 1 : -1);
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${month.name} cards`}
      onClick={onClose}
      className="absolute inset-0 grid place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] print:hidden"
    >
      <div
        className="relative w-full max-w-[720px] touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative max-h-[calc(100dvh-32px)] w-full max-w-[720px] overflow-x-hidden overflow-y-auto rounded-[16px] bg-paper px-[20px] pt-[18px] pb-[20px]"
          style={{
            boxShadow: `0 20px 60px rgba(0,0,0,0.45), inset 0 0 0 3px ${month.color}`,
          }}
        >
          {/* header: flower icon, month name, prev / next */}
          <div className="mb-[16px] flex items-center gap-[12px] max-sm:mb-[10px]">
            <Image
              src={`/months/${String(month.num).padStart(2, "0")}.png`}
              alt=""
              width={189}
              height={189}
              className="size-[40px] flex-none"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[18px] leading-tight font-bold text-ink">
                <span
                  className="mr-[6px] tabular-nums"
                  style={{ color: month.color }}
                >
                  {month.num}
                </span>
                {month.name}{" "}
                <span className="font-serif" style={{ color: month.color }}>
                  {month.ko}
                </span>
              </div>
              <div className="text-[13px] text-muted">{month.note}</div>
            </div>
            <div className="flex gap-[6px]">
              <NavButton
                label="Previous month"
                onClick={() => onStep(-1)}
                dir="left"
              />
              <NavButton
                label="Next month"
                onClick={() => onStep(1)}
                dir="right"
              />
            </div>
          </div>

          {/* the four cards, big */}
          <div
            key={num}
            className={`grid grid-cols-2 gap-x-[14px] gap-y-[18px] max-sm:gap-y-[10px] sm:grid-cols-4 ${
              dir > 0 ? "slide-from-right" : dir < 0 ? "slide-from-left" : ""
            }`}
          >
            {month.cards.map((card, i) => {
              const info = describeCard(month, card);
              return (
                <figure
                  key={i}
                  className="m-0 flex flex-col items-center text-center"
                >
                  <div className="relative aspect-[103.2/168.2] w-full max-w-[150px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] max-sm:h-[min(calc((100dvh-300px)/2),245px)] max-sm:w-auto">
                    {card.img && (
                      <Image
                        src={card.img}
                        alt={card.caption}
                        width={103}
                        height={168}
                        unoptimized
                        className="size-full"
                      />
                    )}
                  </div>
                  <figcaption className="mt-[8px] leading-snug">
                    <div className="text-[14px] font-bold text-ink max-sm:text-[13px]">
                      {info.title}
                    </div>
                    <div className="text-[12px] text-muted max-sm:line-clamp-2 max-sm:text-[11px]">
                      {info.detail}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className="mt-[14px] text-center text-[11px] text-muted max-sm:hidden">
            ← → to browse months · Esc to close
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

function NavButton({
  label,
  onClick,
  dir,
}: {
  label: string;
  onClick: () => void;
  dir: "left" | "right";
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
        <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
