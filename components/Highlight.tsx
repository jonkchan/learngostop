"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Which legend set is selected, and which card images belong to it. Screen-only; never affects print. */
type HighlightState = { key: string; ids: Set<string> } | null;

const HighlightContext = createContext<{
  active: HighlightState;
  toggle: (key: string, ids: string[]) => void;
}>({ active: null, toggle: () => {} });

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<HighlightState>(null);

  const toggle = useCallback((key: string, ids: string[]) => {
    setActive((cur) => (cur?.key === key ? null : { key, ids: new Set(ids) }));
  }, []);

  // Esc or a click anywhere outside a legend tile clears the highlight.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-highlight-trigger]")) setActive(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [active]);

  return <HighlightContext.Provider value={{ active, toggle }}>{children}</HighlightContext.Provider>;
}

const tooltipAlign = {
  left: { box: "left-0", arrow: "left-[10pt]" },
  center: { box: "left-1/2 -translate-x-1/2", arrow: "left-1/2 -translate-x-1/2" },
  right: { box: "right-0", arrow: "right-[10pt]" },
};

/** Wraps a card in the month grid: highlight state from the legend, plus a hover lift and tooltip (screen only). */
export function HighlightCard({
  id,
  tooltip,
  align = "center",
  children,
}: {
  id?: string;
  tooltip?: { title: string; month: string; detail: string };
  /** Which edge the tooltip lines up with, so tooltips on edge cards stay on the page. */
  align?: "left" | "center" | "right";
  children: ReactNode;
}) {
  const { active } = useContext(HighlightContext);
  const state = !active || !id ? "idle" : active.ids.has(id) ? "on" : "off";
  return (
    <div
      className={`group relative rounded-[3pt] transition-[opacity,translate,box-shadow,filter] duration-200 hover:z-20 hover:-translate-y-[3pt] hover:opacity-100 hover:shadow-[0_5pt_10pt_rgba(0,0,0,0.3)] hover:grayscale-0 print:translate-y-0 print:opacity-100 print:shadow-none ${
        state === "on"
          ? "-translate-y-[2pt] shadow-[0_0_0_2pt_var(--color-gold),0_4pt_8pt_rgba(0,0,0,0.25)] hover:shadow-[0_0_0_2pt_var(--color-gold),0_5pt_10pt_rgba(0,0,0,0.3)]"
          : state === "off"
            ? "opacity-[0.12] grayscale print:grayscale-0"
            : ""
      }`}
    >
      {children}
      {tooltip && (
        <span
          role="tooltip"
          className={`pointer-events-none invisible absolute bottom-full z-30 mb-[5pt] w-max max-w-[130pt] translate-y-[2pt] ${tooltipAlign[align].box} rounded-[3pt] bg-ink px-[7pt] py-[5pt] text-left text-[7.4pt] leading-[1.35] text-white opacity-0 shadow-[0_3pt_8pt_rgba(0,0,0,0.3)] transition-[opacity,translate] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 print:hidden`}
        >
          <b className="block text-[8.4pt] font-bold">{tooltip.title}</b>
          <span className="block text-[#ece6dc]">{tooltip.month}</span>
          <span className="mt-[1.5pt] block font-semibold text-[#ffd25a]">{tooltip.detail}</span>
          {/* little arrow pointing at the card */}
          <span className={`absolute top-full ${tooltipAlign[align].arrow} border-x-[4pt] border-t-[4pt] border-x-transparent border-t-ink`} />
        </span>
      )}
    </div>
  );
}

/** A legend tile that selects its set's cards when clicked. */
export function LegendTile({
  setKey,
  ids,
  className,
  children,
}: {
  setKey: string;
  ids: string[];
  className: string;
  children: ReactNode;
}) {
  const { active, toggle } = useContext(HighlightContext);
  const selected = active?.key === setKey;
  return (
    <button
      type="button"
      data-highlight-trigger
      aria-pressed={selected}
      title="Highlight these cards above"
      onClick={() => toggle(setKey, ids)}
      className={`${className} cursor-pointer text-left transition-shadow hover:shadow-[0_0_0_1pt_var(--color-gold)] print:shadow-none ${
        selected ? "shadow-[0_0_0_1.5pt_var(--color-gold)]" : ""
      }`}
    >
      {children}
    </button>
  );
}

/** The month grid that triggers scroll to, so cards picked from page 2 come into view. */
export const MONTH_GRID_ID = "month-grid";

/**
 * A scoring-table row (page 2) that highlights its cards in the month grid (page 1) and scrolls them into view.
 * Screen only: behaves like a plain table row when printed.
 */
export function HighlightRow({
  setKey,
  ids,
  className = "",
  children,
}: {
  setKey: string;
  ids: string[];
  className?: string;
  children: ReactNode;
}) {
  const { active, toggle } = useContext(HighlightContext);
  const selected = active?.key === setKey;
  const pick = () => {
    toggle(setKey, ids);
    if (!selected) document.getElementById(MONTH_GRID_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <tr
      data-highlight-trigger
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      title="Show these cards on page 1"
      onClick={pick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      }}
      className={`cursor-pointer transition-colors hover:bg-gold-soft/60 focus-visible:outline-[1.5pt] focus-visible:outline-gold print:bg-transparent ${
        selected ? "bg-gold-soft" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}
