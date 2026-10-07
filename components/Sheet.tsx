import type { ReactNode } from "react";
import { PlayDemoRow } from "./PlayDemo";

/** One US Letter page. Content is clipped to the sheet so printing always yields exactly one page. */
export function Sheet({ folio, className = "", children }: { folio: string; className?: string; children: ReactNode }) {
  return (
    <section className={`relative mx-auto my-[0.35in] flex h-[11in] w-[8.5in] flex-col overflow-hidden bg-paper px-[0.48in] pt-[0.42in] pb-[0.36in] shadow-[0_6px_24px_rgba(0,0,0,0.25)] break-before-page first:break-before-auto print:my-0 print:shadow-none ${className}`}>
      {/* double frame, like a hwatu card edge */}
      <div className="pointer-events-none absolute inset-[0.2in] rounded-[6pt] border-[2pt] border-hred" />
      <div className="pointer-events-none absolute inset-[calc(0.2in+3.5pt)] rounded-[4pt] border-[0.75pt] border-gold" />
      {children}
      <div className="absolute inset-x-0 bottom-[0.27in] text-center text-[6.8pt] tracking-[0.08em] text-muted uppercase">
        <span className="bg-paper px-[8pt]">{folio}</span>
      </div>
    </section>
  );
}

export function SectionTitle({ ko, className = "", children }: { ko: string; className?: string; children: ReactNode }) {
  return (
    <h2
      className={`mb-[5pt] flex items-baseline gap-[5pt] border-b-[1pt] border-rule pb-[2pt] font-serif text-[12.5pt] leading-[1.15] font-black text-hred ${className}`}
    >
      <Blossom className="size-[10pt] flex-none self-center" />
      {children}
      <span className="text-[9pt] font-medium text-muted">{ko}</span>
    </h2>
  );
}

export function Ko({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`font-serif ${className}`}>{children}</span>;
}

/** A term → definition grid (special plays, penalties). */
export function Terms({
  items,
  demos = false,
}: {
  items: { term: string; ko: string; def: ReactNode }[];
  /** Make each row open an animated demo of that play (Special Plays). */
  demos?: boolean;
}) {
  const rowClass =
    "col-span-2 -mx-[3pt] grid grid-cols-subgrid gap-x-[7pt] rounded-[2pt] px-[3pt] py-[1pt] odd:bg-[#f1e9da]";
  return (
    <dl className="grid grid-cols-[auto_1fr]">
      {items.map((t) => {
        const cells = (
          <>
            <dt className="font-bold whitespace-nowrap">
              {t.term} <Ko className="ml-[2pt] font-bold text-hred">{t.ko}</Ko>
            </dt>
            <dd>{t.def}</dd>
          </>
        );
        return demos ? (
          <PlayDemoRow key={t.term} play={t.term} className={rowClass}>
            {cells}
          </PlayDemoRow>
        ) : (
          <div key={t.term} className={rowClass}>
            {cells}
          </div>
        );
      })}
    </dl>
  );
}

/** A five-petal plum blossom, the motif on February's card. */
export function Blossom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle key={deg} cx="10" cy="5" r="4.2" fill="var(--color-hred)" transform={`rotate(${deg} 10 10)`} />
      ))}
      <circle cx="10" cy="10" r="3" fill="var(--color-gold)" />
    </svg>
  );
}
