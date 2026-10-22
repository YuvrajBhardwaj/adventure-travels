// Builds the site icons from one simple mark (navy square, amber sun, white mountain, green ground).
// The detailed compass logo turns to mush at 16-48 px, which is the size Google and browser tabs use,
// so these icons keep to three or four bold shapes inside a safe zone (Google crops results to a circle).
//
//   node scripts/make-favicons.mjs
//
// Writes public/favicon.svg, favicon.png (192), favicon-512.png, apple-touch-icon.png (180) and favicon.ico (16/32/48).
// Keep these URLs stable: Google caches the favicon by URL.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B2A47"/>
      <stop offset="1" stop-color="#0B1222"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBBF24"/>
      <stop offset="1" stop-color="#F97316"/>
    </linearGradient>
    <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#10B981"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sky)"/>
  <circle cx="300" cy="238" r="112" fill="url(#sun)"/>
  <path d="M64 404 L212 148 L280 262 L330 186 L448 404 Z" fill="#F8FAFC"/>
  <path d="M212 148 L280 262 L262 404 L204 404 Z" fill="#CBD5E1"/>
  <path d="M330 186 L448 404 L372 404 Z" fill="#CBD5E1"/>
  <rect y="404" width="512" height="108" fill="url(#land)"/>
</svg>
`;

const svgBuffer = Buffer.from(SVG);
const png = (size) => sharp(svgBuffer, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// An .ico can hold PNG-compressed images, so build it by hand.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

writeFileSync(join(pub, "favicon.svg"), SVG);
writeFileSync(join(pub, "favicon.png"), await png(192));
writeFileSync(join(pub, "favicon-512.png"), await png(512));
writeFileSync(join(pub, "apple-touch-icon.png"), await sharp(await png(180)).flatten({ background: "#0B1222" }).png().toBuffer());
writeFileSync(
  join(pub, "favicon.ico"),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) }))))
);
console.log("favicons written to public/");
