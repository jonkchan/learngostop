"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Makes a block on the sheet clickable: opens `large` in a centered overlay
 * (close with ✕, Esc or the backdrop). Both versions are rendered by the caller. Screen only.
 */
export function Zoomable({
  label,
  className,
  large,
  children,
}: {
  /** Accessible name for the overlay, e.g. "Example: your side of the table". */
  label: string;
  className: string;
  large: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Enlarge ${label}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`${className} cursor-zoom-in transition-shadow hover:ring-[1.5pt] hover:ring-gold focus-visible:outline-[1.5pt] focus-visible:outline-gold print:ring-0`}
      >
        {children}
      </div>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-[16px] backdrop-blur-[2px] print:hidden"
          >
            <div className="relative w-full max-w-[760px]" onClick={(e) => e.stopPropagation()}>
              <div className="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[16px] bg-paper px-[22px] pt-[20px] pb-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-gold)]">
                {large}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
          </div>,
          document.body,
        )}
    </>
  );
}
