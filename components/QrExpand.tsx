"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ViewportOverlay } from "./ViewportOverlay";

/**
 * Wraps the small header QR code: clicking it opens a large, easy-to-scan copy in an overlay.
 * Both QR codes are rendered on the server and passed in. Screen only.
 */
export function QrExpand({
  label,
  className,
  large,
  children,
}: {
  /** The site address shown under the big code, e.g. "learngostop.com". */
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show a larger QR code"
        title="Click to enlarge"
        className={`${className} cursor-zoom-in transition-transform hover:scale-105`}
      >
        {children}
      </button>
      {open && (
        // a portal, so the overlay isn't clipped or scaled by the letter-size sheet
        <ViewportOverlay>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`QR code for ${label}`}
            onClick={() => setOpen(false)}
            className="absolute inset-0 grid place-items-center bg-black/60 p-[24px] backdrop-blur-[2px] print:hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center gap-[12px] rounded-[16px] bg-paper px-[28px] pt-[28px] pb-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_0_0_3px_var(--color-hred)]"
            >
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
              <div className="size-[min(72vw,300px)]">{large}</div>
              <div className="text-center font-sans">
                <div className="text-[13px] text-muted">Scan to open</div>
                <div className="font-serif text-[22px] font-black text-hred">
                  {label}
                </div>
              </div>
            </div>
          </div>
        </ViewportOverlay>
      )}
    </>
  );
}
