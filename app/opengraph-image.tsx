import { ImageResponse } from "next/og";

export const alt = "Go-Stop Guide: how to play the Korean hwatu card game, with rules, scoring and a printable cheat sheet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const red = "#c8102e";
const gold = "#f2b822";
const paper = "#fff9ef";
const ink = "#1d1a17";
// the month accent colors, used for the fanned cards
const fan = ["#1f7a3a", "#e0458f", "#b87800", "#7a4f2a", "#46586b"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: paper,
          padding: 28,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `6px solid ${red}`,
            borderRadius: 24,
            padding: "0 72px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: red, letterSpacing: 4 }}>HOW TO PLAY</div>
            <div style={{ fontSize: 132, fontWeight: 900, color: ink, lineHeight: 1, marginTop: 8 }}>Go-Stop</div>
            <div style={{ fontSize: 34, color: "#6b635a", marginTop: 24, lineHeight: 1.3 }}>
              The Korean hwatu card game: card chart, rules, scoring and Go-or-Stop, on one printable sheet.
            </div>
          </div>
          <div style={{ display: "flex", position: "relative", width: 330, height: 320, marginRight: 10 }}>
            {fan.map((color, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 80 + (i - 2) * 40,
                  top: 40,
                  width: 140,
                  height: 210,
                  borderRadius: 14,
                  background: "#ffeaa8",
                  border: `5px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `rotate(${(i - 2) * 12}deg)`,
                  transformOrigin: "50% 120%",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
                }}
              >
                <div style={{ width: 70, height: 70, borderRadius: 999, background: red, border: `5px solid ${gold}` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
