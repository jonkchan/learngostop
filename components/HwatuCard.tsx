import type { Card, RibbonKind } from "@/lib/deck";

const ribbonStyles: Record<RibbonKind, { className: string; label?: string }> = {
  hong: { className: "bg-hred", label: "홍단" },
  cheong: { className: "bg-hblue", label: "청단" },
  cho: { className: "bg-hred rib-cho" },
  plain: { className: "bg-[#c76b3c] rib-plain" },
};

const base =
  "relative flex aspect-[33/44] flex-col items-center overflow-hidden rounded-[3pt] border-[0.9pt] px-[1pt] text-center";
const caption = "mt-[2pt] text-[5.7pt] leading-[1.1] font-semibold break-keep";
const tagBase = "absolute top-[1.5pt] right-[1.5pt] rounded-[2pt] px-[1.8pt] text-[5pt] leading-[1.5] font-bold text-white";

export function HwatuCard({ card }: { card: Card }) {
  switch (card.type) {
    case "gwang":
      return (
        <div className={`${base} justify-center border-[#c99b2b] bg-gold-soft py-[2pt]`}>
          <div className="grid size-[16pt] place-items-center rounded-full select-none bg-hred font-serif text-[9pt] font-black leading-none text-white">
            <span className="[text-box:trim-both_cap_alphabetic]">光</span>
          </div>
          <div className={caption}>{card.caption}</div>
        </div>
      );
    case "animal":
      return (
        <div className={`${base} justify-center border-[#b49a6c] bg-tan py-[2pt]`}>
          {card.tag && <span className={`${tagBase} bg-ink`}>{card.tag}</span>}
          <div className="font-serif text-[9.5pt] font-black leading-none text-[#6c4d1d]">열</div>
          <div className={caption}>{card.caption}</div>
        </div>
      );
    case "ribbon": {
      const rib = ribbonStyles[card.ribbon];
      return (
        <div className={`${base} justify-start border-[#b9ad99] bg-card pb-[2pt]`}>
          <div
            className={`flex h-[62%] w-[9pt] items-center justify-center rounded-b-[2pt] font-serif text-[5.4pt] font-black tracking-[-0.5pt] text-white [text-orientation:upright] [writing-mode:vertical-rl] ${rib.className}`}
          >
            {rib.label}
          </div>
          <div className={`${caption} mt-auto mb-[1pt]`}>{card.caption}</div>
        </div>
      );
    }
    case "pi":
      return (
        <div className={`${base} justify-center border-[#a9bd9a] bg-hgreen-soft py-[2pt]`}>
          {card.tag && <span className={`${tagBase} bg-hgreen`}>{card.tag}</span>}
          <div className="font-serif text-[10pt] font-black leading-none text-hgreen opacity-85">피</div>
          <div className={caption}>{card.caption}</div>
        </div>
      );
  }
}

const miniColors: Record<Card["type"], string> = {
  gwang: "border-[#c99b2b] bg-gold-soft",
  animal: "border-[#b49a6c] bg-tan",
  ribbon: "border-[#b9ad99] bg-card",
  pi: "border-[#a9bd9a] bg-hgreen-soft",
};

/** A small, caption-less card for fanned piles. */
export function MiniCard({ card }: { card: Card }) {
  return (
    <div
      className={`relative flex h-[22pt] w-[16pt] flex-none flex-col items-center justify-center overflow-hidden rounded-[2pt] border-[0.75pt] shadow-[-1pt_0_2pt_rgba(0,0,0,0.12)] ${miniColors[card.type]}`}
    >
      {card.type === "gwang" && (
        <div className="grid size-[11pt] place-items-center rounded-full select-none bg-hred font-serif text-[6.5pt] font-black leading-none text-white">
          <span className="[text-box:trim-both_cap_alphabetic]">光</span>
        </div>
      )}
      {card.type === "animal" && <div className="font-serif text-[7.5pt] font-black leading-none text-[#6c4d1d]">열</div>}
      {card.type === "ribbon" && (
        <div className={`absolute top-0 h-[60%] w-[5pt] rounded-b-[1pt] ${ribbonStyles[card.ribbon].className}`} />
      )}
      {card.type === "pi" && (
        <>
          {card.tag && (
            <span className="absolute top-[1pt] right-[1pt] rounded-[1pt] bg-hgreen px-[1pt] text-[4pt] leading-[1.4] font-bold text-white">
              {card.tag}
            </span>
          )}
          <div className="font-serif text-[7.5pt] font-black leading-none text-hgreen opacity-85">피</div>
        </>
      )}
    </div>
  );
}
