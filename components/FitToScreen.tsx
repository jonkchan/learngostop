"use client";

import { useEffect } from "react";

/** A letter sheet plus its side margins, in CSS px (8.9in). */
const SHEET_WIDTH_PX = 8.9 * 96;

/** Shrinks the letter-size sheets to fit narrow screens by setting --sheet-zoom (used in globals.css). */
export function FitToScreen() {
  useEffect(() => {
    let current = "";
    const update = () => {
      // Pinch-zooming on a phone fires resize events with a smaller visible width. Re-fitting then would
      // shrink the page under the user's fingers, so leave the scale alone while the page is zoomed in.
      if (window.visualViewport && window.visualViewport.scale > 1.01) return;
      // The layout width (not the visible width) is stable while zooming; cap by the real screen width
      // because phones widen the layout to fit the unscaled sheets.
      const width = Math.min(document.documentElement.clientWidth, window.screen.width);
      const zoom = String(Math.min(1, width / SHEET_WIDTH_PX));
      if (zoom === current) return; // e.g. Safari's toolbar showing/hiding only changes the height
      current = zoom;
      document.documentElement.style.setProperty("--sheet-zoom", zoom);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return null;
}
