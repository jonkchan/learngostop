import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Go-Stop Guide: how to play the Korean hwatu card game, with rules, scoring and a printable cheat sheet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const red = "#c8102e";
const deepRed = "#8e0b22";
const gold = "#f2b822";
const cream = "#fff3dc";

/** The five gwang (brightest cards), fanned on the right. */
const GWANG = ["01-1", "03-1", "08-1", "11-1", "12-1"];

/** A five-petal plum blossom, the site's motif. */
function Blossom({ x, y, r, opacity, center = true }: { x: number; y: number; r: number; opacity: number; center?: boolean }) {
  return (
    <svg
      width={r * 4}
      height={r * 4}
      viewBox="-20 -20 40 40"
      style={{ position: "absolute", left: x - r * 2, top: y - r * 2, opacity }}
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle key={deg} cx="0" cy="-9" r="8.4" fill="#ff8a8f" transform={`rotate(${deg})`} />
      ))}
      {center && <circle r="5" fill={gold} />}
    </svg>
  );
}

export default function OpengraphImage() {
  const root = process.cwd();
  // Synchronous reads on purpose: with Cache Components, async file reads would stop this from being prerendered
  // at build time. Satori needs TTF at fixed weights; scripts/subset-font.py makes these alongside the site font.
  const serif900 = readFileSync(join(root, "app/fonts/og-NotoSerifKR-900.ttf"));
  const serif600 = readFileSync(join(root, "app/fonts/og-NotoSerifKR-600.ttf"));
  const cards = GWANG.map((id) => readFileSync(join(root, "public/cards", `${id}.svg`), "base64"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `radial-gradient(circle at 78% 45%, #e0283f 0%, ${red} 38%, ${deepRed} 100%)`,
          fontFamily: "Noto Serif KR",
        }}
      >
        {/* scattered blossoms */}
        <Blossom x={70} y={560} r={42} opacity={0.35} />
        <Blossom x={560} y={70} r={26} opacity={0.3} />
        <Blossom x={640} y={585} r={20} opacity={0.28} />
        <Blossom x={1150} y={60} r={34} opacity={0.3} />
        <Blossom x={1160} y={590} r={24} opacity={0.25} />

        {/* gold double frame, like a card edge */}
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 22,
            right: 22,
            bottom: 22,
            border: `5px solid ${gold}`,
            borderRadius: 26,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 34,
            right: 34,
            bottom: 34,
            border: "2px solid rgba(242,184,34,0.55)",
            borderRadius: 18,
            display: "flex",
          }}
        />

        {/* text */}
        <div
          style={{
            position: "absolute",
            left: 86,
            top: 0,
            bottom: 0,
            width: 600,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                background: gold,
                color: deepRed,
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 4,
                padding: "6px 18px 8px",
                borderRadius: 999,
              }}
            >
              HOW TO PLAY
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 18,
              color: "#fff",
              fontSize: 136,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -2,
              textShadow: "0 6px 0 rgba(0,0,0,0.18)",
            }}
          >
            Go-Stop
          </div>
          <div style={{ display: "flex", color: gold, fontSize: 64, fontWeight: 900, marginTop: 4 }}>고스톱</div>
          <div style={{ display: "flex", color: cream, fontSize: 32, fontWeight: 600, lineHeight: 1.3, marginTop: 22 }}>
            The Korean flower-card game, on one printable cheat sheet.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            {["Free", "Printable", "Rules & scoring"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  color: cream,
                  fontSize: 24,
                  fontWeight: 600,
                  padding: "6px 18px 8px",
                  borderRadius: 999,
                  border: "2px solid rgba(255,243,220,0.6)",
                  background: "rgba(0,0,0,0.12)",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* fan of the five gwang */}
        {cards.map((data, i) => (
          <div
            key={GWANG[i]}
            style={{
              position: "absolute",
              left: 905 + (i - 2) * 56 - 82,
              top: 160 + Math.abs(i - 2) * 16,
              width: 164,
              height: 268,
              display: "flex",
              padding: 7,
              background: "#fff",
              borderRadius: 16,
              transform: `rotate(${(i - 2) * 11}deg)`,
              boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
            }}
          >
            <img src={`data:image/svg+xml;base64,${data}`} width={150} height={254} style={{ borderRadius: 10 }} alt="" />
          </div>
        ))}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Serif KR", data: serif900, weight: 900, style: "normal" },
        { name: "Noto Serif KR", data: serif600, weight: 600, style: "normal" },
      ],
    },
  );
}
