"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Viewport = { x: number; y: number; w: number; h: number; scale: number };

function readViewport(): Viewport | null {
  const v = window.visualViewport;
  return v
    ? {
        x: v.offsetLeft,
        y: v.offsetTop,
        w: v.width,
        h: v.height,
        scale: v.scale,
      }
    : null;
}

/**
 * Hosts a dialog over exactly the part of the page the user can see, at normal size.
 *
 * On a phone that's pinch-zoomed in, a plain full-screen overlay gets magnified along with the page,
 * so the dialog ends up huge and cut off. Instead this pins a box to the visual viewport and lays the
 * dialog out at un-zoomed size, then scales it down by the zoom factor, so it looks normal on screen.
 * It follows along if the user keeps pinching or panning. Children should fill it with `absolute inset-0`.
 *
 * While open, the rest of the page is made `inert` (so Tab and screen readers stay inside the dialog),
 * focus moves to the `role="dialog"` element, and it goes back to whatever opened it on close.
 */
export function ViewportOverlay({ children }: { children: ReactNode }) {
  const [vp, setVp] = useState<Viewport | null>(readViewport);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const opener = document.activeElement as HTMLElement | null;
    const others = [...document.body.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== host && !el.inert,
    );
    others.forEach((el) => (el.inert = true));
    const dialog = host.querySelector<HTMLElement>('[role="dialog"]');
    if (dialog) {
      dialog.tabIndex = -1;
      dialog.style.outline = "none";
      dialog.focus({ preventScroll: true });
    }
    return () => {
      others.forEach((el) => (el.inert = false));
      opener?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setVp(readViewport());
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, []);

  const overlay = vp ? (
    <div
      ref={root}
      className="fixed z-50 overflow-hidden print:hidden"
      style={{ left: vp.x, top: vp.y, width: vp.w, height: vp.h }}
    >
      <div
        className="relative origin-top-left"
        style={{
          width: vp.w * vp.scale,
          height: vp.h * vp.scale,
          transform: `scale(${1 / vp.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  ) : (
    // browsers without visualViewport: a plain full-screen overlay
    <div ref={root} className="fixed inset-0 z-50 print:hidden">
      {children}
    </div>
  );

  return createPortal(overlay, document.body);
}
