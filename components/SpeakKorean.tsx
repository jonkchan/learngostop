"use client";

import { useEffect } from "react";

const HANGUL = /[가-힣ㄱ-ㆎ]/;

/**
 * The run of Korean text under a tap, for Korean that isn't in its own lang="ko" element (e.g. "Gwang 광").
 * Uses the caret position under the point, then checks the point is really on that character (the caret APIs
 * also return the nearest position when you tap blank space), and widens to the whole Korean word or phrase.
 */
function hangulAt(x: number, y: number): string | null {
  let node: Node | null = null;
  let offset = 0;
  if ("caretPositionFromPoint" in document) {
    const p = document.caretPositionFromPoint(x, y);
    if (p) [node, offset] = [p.offsetNode, p.offset];
  } else if ("caretRangeFromPoint" in document) {
    const r = (document as Document).caretRangeFromPoint(x, y);
    if (r) [node, offset] = [r.startContainer, r.startOffset];
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const s = (node as Text).data;
  // the caret can land on either side of the tapped character
  for (const i of [offset, offset - 1]) {
    if (i < 0 || i >= s.length || !HANGUL.test(s[i])) continue;
    const range = document.createRange();
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const b = range.getBoundingClientRect();
    if (x < b.left - 2 || x > b.right + 2 || y < b.top - 2 || y > b.bottom + 2) continue;
    // widen over Korean characters, and single spaces between them ("패 돌리기")
    let a = i;
    let z = i + 1;
    while (a > 0 && (HANGUL.test(s[a - 1]) || (s[a - 1] === " " && HANGUL.test(s[a - 2] ?? "")))) a--;
    while (z < s.length && (HANGUL.test(s[z]) || (s[z] === " " && HANGUL.test(s[z + 1] ?? "")))) z++;
    return s.slice(a, z).trim();
  }
  return null;
}

/**
 * Tap any Korean text to hear it read aloud by the browser's Korean voice.
 *
 * One listener for the whole page (dialogs included) instead of wiring up every label. A lang="ko" element is read
 * whole ("고 / 스톱"); Korean inside other text is found under the tap. On whenever the browser can speak at all:
 * iOS Safari often lists no voices until speech has been used, so the voice is looked up again at tap time, and with
 * none listed we just ask for ko-KR. <html> gets `speak-ko` for the hover cue in globals.css. A tap on Korean speaks
 * instead of doing whatever its row or tile would do. Screen only, mouse/touch only: screen readers already read
 * the lang="ko" labels in Korean.
 */
export function SpeakKorean() {
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const root = document.documentElement;
    let voice: SpeechSynthesisVoice | undefined;

    root.classList.add("speak-ko");

    const pickVoice = () => {
      const ko = synth.getVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("ko"));
      // Voices installed on the device first: network voices (e.g. Chrome's "Google 한국의") can fail silently.
      // Among those, natural-sounding female voices (Apple's Yuna, Microsoft's SunHi/Heami, enhanced ones), then
      // Apple's female novelty voices, then anything Korean.
      const rank = (v: SpeechSynthesisVoice) =>
        (v.localService ? 0 : 10) +
        (/yuna|sunhi|heami|sora|premium|enhanced|natural|google/i.test(v.name) ? 0 : /flo|sandy|shelley/i.test(v.name) ? 1 : 2);
      voice = [...ko].sort((a, b) => rank(a) - rank(b))[0];
    };
    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice); // voices load asynchronously in Chrome

    let speaking: Element | null = null;
    let clear = 0;

    const say = (text: string, withVoice: boolean, onDone: () => void) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? "ko-KR";
      if (withVoice && voice) u.voice = voice;
      u.rate = 0.85;
      u.onend = onDone;
      u.onerror = (ev) => {
        onDone();
        // the chosen voice failed: try once more and let the OS pick its default Korean voice
        if (withVoice && voice && ev.error !== "interrupted" && ev.error !== "canceled") say(text, false, onDone);
      };
      synth.speak(u);
    };

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest('[lang="ko"]') ?? null;
      // "고 / 스톱" → "고 스톱": drop separators so they aren't read out
      const text = el ? (el.textContent ?? "").replace(/[·/|()]/g, " ").trim() : hangulAt(e.clientX, e.clientY);
      if (!text) return;
      e.preventDefault();
      e.stopPropagation(); // capture phase: the row or tile underneath never sees this click

      // only cancel if something is playing: Safari can drop a speak() that comes right after cancel()
      if (synth.speaking || synth.pending) synth.cancel();
      if (synth.paused) synth.resume(); // Chrome can leave the queue paused after the tab was in the background
      speaking?.classList.remove("ko-speaking");
      if (!voice) pickVoice(); // iOS: the list may only be filled in now

      speaking = el;
      el?.classList.add("ko-speaking");
      const done = () => el?.classList.remove("ko-speaking");
      // some browsers never fire onend; don't leave the highlight stuck
      window.clearTimeout(clear);
      clear = window.setTimeout(done, 400 + text.length * 250);
      say(text, true, done);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      synth.removeEventListener("voiceschanged", pickVoice);
      document.removeEventListener("click", onClick, true);
      root.classList.remove("speak-ko");
      window.clearTimeout(clear);
      synth.cancel();
    };
  }, []);

  return null;
}
