"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { siteTitle, siteUrl } from "@/lib/site";

/** The floating Share and Print buttons in the bottom-right corner (screen only). */
export function FloatingActions() {
  // On phones the buttons tuck away while scrolling down and return on scroll-up or at the top.
  const [hidden, setHidden] = useState(false);
  // Hidden on every screen size while the page is pinch-zoomed, so the buttons don't cover the zoomed-in text.
  const [zoomed, setZoomed] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onZoom = () => setZoomed(vv.scale > 1.05);
    onZoom();
    vv.addEventListener("resize", onZoom);
    return () => vv.removeEventListener("resize", onZoom);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 40) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed right-[18px] bottom-[18px] flex items-center gap-[10px] transition-[translate,opacity] duration-300 max-sm:right-[16px] max-sm:bottom-[16px] max-sm:flex-col-reverse max-sm:gap-[12px] print:hidden ${
        zoomed
          ? "pointer-events-none translate-y-[120%] opacity-0"
          : hidden
            ? "max-sm:pointer-events-none max-sm:translate-y-[120%] max-sm:opacity-0"
            : ""
      }`}
    >
      <ShareButton />
      <ActionButton label="Print" icon={<PrinterIcon />} onClick={() => window.print()} primary />
    </div>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: siteTitle, text: "A printable cheat sheet for Go-Stop (고스톱)", url: siteUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // the user closed the share sheet; nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", siteUrl);
    }
  };

  return (
    <div className="relative">
      <ActionButton label="Share" icon={<ShareIcon />} onClick={share} />
      <span
        role="status"
        className={`pointer-events-none absolute bottom-full left-1/2 mb-[8px] -translate-x-1/2 rounded-full bg-ink px-[10px] py-[4px] text-[12px] font-semibold whitespace-nowrap text-white transition-opacity duration-200 max-sm:right-full max-sm:bottom-1/2 max-sm:left-auto max-sm:mr-[10px] max-sm:mb-0 max-sm:translate-x-0 max-sm:translate-y-1/2 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        Link copied!
      </span>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  primary = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex cursor-pointer items-center gap-[8px] rounded-full py-[10px] pr-[18px] pl-[14px] text-[14px] font-bold text-ink shadow-[0_4px_14px_rgba(0,0,0,0.35)] max-sm:p-[16px] ${
        primary ? "bg-gold" : "bg-paper"
      }`}
    >
      {icon}
      <span className="max-sm:hidden">{label}</span>
    </button>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  className: "size-[18px] flex-none max-sm:size-[28px]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PrinterIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

/** A box with an arrow leaving it, the familiar "share" mark. */
function ShareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
