"use client";

import { useEffect } from "react";

/** A letter sheet plus its side margins, in CSS px (8.9in). */
const SHEET_WIDTH_PX = 8.9 * 96;

/** Shrinks the letter-size sheets to fit narrow screens by setting --sheet-zoom (used in globals.css). */
export function FitToScreen() {
  useEffect(() => {
    const update = () => {
      // Phones widen innerWidth to fit the unscaled sheets, so also cap by the device's real screen width.
      const width = Math.min(window.innerWidth, window.screen.width);
      const zoom = Math.min(1, width / SHEET_WIDTH_PX);
      document.documentElement.style.setProperty("--sheet-zoom", String(zoom));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return null;
}
