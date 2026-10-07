"use client";

import { useEffect } from "react";

/**
 * Tap any Korean text (anything marked lang="ko") to hear it read aloud by the browser's Korean voice.
 *
 * One listener for the whole page (dialogs included) instead of wiring up every label. It only turns on when the
 * device has a Korean voice; then <html> gets `speak-ko`, which globals.css uses for the hover cue. A click on
 * Korean text speaks instead of doing whatever its row or tile would do. Screen only, mouse/touch only: screen
 * readers already read these in Korean because of lang="ko".
 */
export function SpeakKorean() {
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const root = document.documentElement;
    let voice: SpeechSynthesisVoice | undefined;

    const pickVoice = () => {
      const ko = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ko"));
      // prefer a natural-sounding female voice: Apple's Yuna, Google's, Microsoft's SunHi/Heami, enhanced ones;
      // then Apple's female novelty voices; then whatever Korean voice there is
      voice =
        ko.find((v) => /yuna|google|sunhi|heami|sora|premium|enhanced|natural/i.test(v.name)) ??
        ko.find((v) => /flo|sandy|shelley/i.test(v.name)) ??
        ko[0];
      root.classList.toggle("speak-ko", !!voice);
    };
    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice); // voices load asynchronously in Chrome

    let speaking: Element | null = null;
    let clear = 0;
    const onClick = (e: MouseEvent) => {
      if (!voice) return;
      const el = (e.target as Element | null)?.closest('[lang="ko"]');
      if (!el) return;
      // "고 / 스톱" → "고 스톱": drop separators so they aren't read out
      const text = (el.textContent ?? "").replace(/[·/|()]/g, " ").trim();
      if (!text) return;
      e.preventDefault();
      e.stopPropagation(); // capture phase: the row or tile underneath never sees this click

      synth.cancel();
      speaking?.classList.remove("ko-speaking");
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.85;
      speaking = el;
      el.classList.add("ko-speaking");
      const done = () => el.classList.remove("ko-speaking");
      u.onend = u.onerror = done;
      // some browsers never fire onend; don't leave the highlight stuck
      window.clearTimeout(clear);
      clear = window.setTimeout(done, 400 + text.length * 250);
      synth.speak(u);
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
