import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Himalayan Arc Adventure — guided Himalayan treks and Auli snow school";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/brand/logo.png"), "base64");

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        alignItems: "center",
        padding: "56px 72px",
        color: "white",
        background: "linear-gradient(120deg, #0F172A 0%, #13263B 58%, #064E4B 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -220,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.32), rgba(16,185,129,0))",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 58 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logo}`}
          alt=""
          width={250}
          height={250}
          style={{ borderRadius: 28 }}
        />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ color: "#6EE7B7", fontSize: 20, fontWeight: 700, letterSpacing: 5 }}>
            UTTARAKHAND · HIMACHAL
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 20, fontSize: 72, lineHeight: 1.08, fontWeight: 800, letterSpacing: -2 }}>
            <div>One range.</div>
            <div>Two seasons.</div>
          </div>
          <div style={{ marginTop: 24, color: "#D1D5DB", fontSize: 28, lineHeight: 1.35 }}>
            Guided Himalayan treks &amp; Auli snow school
          </div>
          <div style={{ marginTop: 34, color: "#FCD34D", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
            HIMALAYANARCADVENTURE.COM
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
