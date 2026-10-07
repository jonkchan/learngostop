import type { Month } from "@/lib/deck";
import { HwatuCard } from "./HwatuCard";
import { Ko } from "./Sheet";

export function MonthBlock({ month }: { month: Month }) {
  return (
    <div
      className="rounded-[5pt] border-[0.75pt] border-rule bg-card px-[7pt] pt-[5pt] pb-[6pt]"
      style={{
        // colored cap + soft wash in the month's flower color; an inset shadow keeps the layout height unchanged
        boxShadow: `inset 0 2.5pt 0 ${month.color}`,
        backgroundImage: `linear-gradient(to bottom, ${month.color}22, transparent 45%)`,
      }}
    >
      <div className="mb-[5pt] flex items-center gap-[5pt]">
        <div
          className="grid size-[15pt] flex-none place-items-center rounded-full select-none text-[8pt] leading-none font-bold text-white tabular-nums"
          style={{ backgroundColor: month.color }}
        >
          <span className="[text-box:trim-both_cap_alphabetic]">{month.num}</span>
        </div>
        <div className="text-[8.2pt] leading-[1.1] font-bold">
          {month.name}{" "}
          <span style={{ color: month.color }}>
            <Ko className="ml-[2pt]">{month.ko}</Ko>
          </span>
          <small className="block text-[6.7pt] font-normal text-muted">{month.note}</small>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-[4pt]">
        {month.cards.map((card, i) => (
          <HwatuCard key={i} card={card} />
        ))}
      </div>
    </div>
  );
}
