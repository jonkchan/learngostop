import Image from "next/image";
import { describeCard, type Month } from "@/lib/deck";
import { HighlightCard } from "./Highlight";
import { HwatuCard } from "./HwatuCard";
import { MonthZoom } from "./MonthZoom";
import { Ko } from "./Sheet";

export function MonthBlock({ month }: { month: Month }) {
  return (
    <MonthZoom
      num={month.num}
      className="rounded-[5pt] border-[0.75pt] border-rule bg-card px-[8pt] pt-[6pt] pb-[5pt]"
      style={{
        // colored cap + soft wash in the month's flower color; an inset shadow keeps the layout height unchanged
        boxShadow: `inset 0 2.5pt 0 ${month.color}`,
        backgroundImage: `linear-gradient(to bottom, ${month.color}22, transparent 45%)`,
      }}
    >
      <div className="mb-[5pt] flex items-center gap-[6pt]">
        {/* flower icon (Sem, Fuda Wiki, CC BY 4.0) with the month number as a corner badge */}
        <div className="relative -my-[1pt] size-[18pt] flex-none select-none">
          <Image
            src={`/months/${String(month.num).padStart(2, "0")}.png`}
            alt=""
            width={189}
            height={189}
            loading="eager"
            className="size-full"
          />
          <span
            className="absolute -right-[3pt] -bottom-[2pt] grid size-[10pt] place-items-center rounded-full text-[5.6pt] leading-none font-bold text-white tabular-nums shadow-[0_0_0_1pt_var(--color-card)]"
            style={{ backgroundColor: month.color }}
          >
            <span className="[text-box:trim-both_cap_alphabetic]">{month.num}</span>
          </span>
        </div>
        <div className="text-[8.2pt] leading-[1.1] font-bold">
          {month.name}{" "}
          <span style={{ color: month.color }}>
            <Ko className="ml-[2pt]">{month.ko}</Ko>
          </span>
          <small className="block text-[6.7pt] font-normal text-muted">{month.note}</small>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-[5pt]">
        {month.cards.map((card, i) => (
          <HighlightCard key={i} id={card.img} tooltip={describeCard(month, card)}
            align={i === 0 ? "left" : i === 3 ? "right" : "center"}
          >
            <HwatuCard card={card} />
          </HighlightCard>
        ))}
      </div>
    </MonthZoom>
  );
}
