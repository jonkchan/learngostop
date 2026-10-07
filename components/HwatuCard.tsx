import Image from "next/image";
import type { Card } from "@/lib/deck";

const tagBase =
  "absolute top-[1.5pt] right-[1.5pt] rounded-[2.5pt] px-[2.5pt] text-[7pt] leading-[1.35] font-black text-white shadow-[0_0_0_1pt_#fff]";

/** Caption color per card type, matching the type tiles and "Reading the cards". */
const typeText: Record<Card["type"], string> = {
  gwang: "text-[#a06c00]",
  animal: "text-[#7a5418]",
  ribbon: "text-hred",
  pi: "text-hgreen",
};

/** A full card: the real card art with its caption underneath and any G / ×2 badge on top. */
export function HwatuCard({ card }: { card: Card }) {
  const tag = "tag" in card ? card.tag : undefined;
  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[103.2/168.2] w-full">
        {card.img && (
          <Image
            src={card.img}
            alt={card.caption}
            width={103}
            height={168}
            unoptimized
            loading="eager"
            className="size-full select-none drop-shadow-[0_0.75pt_0.75pt_rgba(0,0,0,0.18)]"
          />
        )}
        {tag && <span className={`${tagBase} ${card.type === "pi" ? "bg-hgreen" : "bg-ink"}`}>{tag}</span>}
        {card.type === "animal" && <AnimalMark className="top-[1.5pt] left-[1.5pt] size-[11pt] text-[6.5pt]" />}
      </div>
      <div className={`mt-[2pt] text-center text-[6pt] leading-[1.1] font-bold whitespace-nowrap ${typeText[card.type]}`}>
        {card.caption}
      </div>
    </div>
  );
}

/** A small, caption-less card for fanned piles and inline examples. */
export function MiniCard({
  card,
  size = "h-[23pt] w-[14pt]",
  showTag = true,
}: {
  card: Card;
  size?: string;
  showTag?: boolean;
}) {
  const tag = showTag && "tag" in card && card.type === "pi" ? card.tag : undefined;
  return (
    <div className={`relative flex-none drop-shadow-[-0.75pt_0_1pt_rgba(0,0,0,0.2)] ${size}`}>
      {card.img && (
        <Image
          src={card.img}
          alt={card.caption}
          width={103}
          height={168}
          unoptimized
          loading="eager"
          className="size-full select-none"
        />
      )}
      {tag && (
        <span className="absolute top-[1pt] right-[1pt] rounded-[1.5pt] bg-hgreen px-[1.5pt] text-[5.5pt] leading-[1.3] font-black text-white shadow-[0_0_0_0.75pt_#fff]">
          {tag}
        </span>
      )}
    </div>
  );
}

/** "열" in a brown circle: marks animal (열끗) cards, the way 光 marks gwang cards. */
function AnimalMark({ className }: { className: string }) {
  return (
    <span
      className={`absolute grid place-items-center rounded-full bg-[#7a5418] font-serif leading-none font-black text-white shadow-[0_0_0_1pt_#fff] select-none ${className}`}
    >
      <span className="[text-box:trim-both_cap_alphabetic]">열</span>
    </span>
  );
}
