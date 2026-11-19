// Builds the header badge and the site icons from the owner's logo (scripts/assets/logo-source.png,
// black artwork on a transparent background), recoloured snow white on black (owner, 20 Nov 2026).
//
//   node scripts/make-favicons.mjs
//
// Writes public/brand/badge.png (header), favicon.svg, favicon.png (192), favicon-512.png,
// apple-touch-icon.png (180) and favicon.ico (16/32/48). Keep these URLs stable: Google caches
// the favicon by URL. The wordmark can't be read below ~48 px, so the tab icons (16–48 px) use
// the logo's central peak only; 180 px and up use the whole logo.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const SNOW = [248, 250, 252]; // #F8FAFC
const BLACK = "#000000";

// Snow-white artwork on black, full 1254 px square: the logo's ink becomes the alpha of a snow fill.
const mask = await sharp(join(root, "scripts/assets/logo-source.png"))
  .flatten({ background: "#ffffff" })
  .greyscale()
  .negate()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = mask.info;
const art = await sharp({ create: { width, height, channels: 3, background: { r: SNOW[0], g: SNOW[1], b: SNOW[2] } } })
  .joinChannel(mask.data, { raw: { width, height, channels: 1 } })
  .flatten({ background: BLACK })
  .png()
  .toBuffer();

// Square crops in source pixels: the whole logo (circle plus the wordmark that overhangs it),
// and the central peak for tiny icons.
const WHOLE = { left: 37, top: 41, width: 1180, height: 1180 };
const PEAK = { left: 455, top: 300, width: 350, height: 350 };
const crop = (box, size, pad = 0) =>
  sharp(art)
    .extract(box)
    .resize(size - 2 * pad, size - 2 * pad)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BLACK })
    .flatten({ background: BLACK })
    .png({ compressionLevel: 9 })
    .toBuffer();

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

writeFileSync(join(pub, "brand/badge.png"), await crop(WHOLE, 384));
writeFileSync(join(pub, "favicon.png"), await crop(WHOLE, 192, 6));
writeFileSync(join(pub, "favicon-512.png"), await crop(WHOLE, 512, 16));
writeFileSync(join(pub, "apple-touch-icon.png"), await crop(WHOLE, 180, 6));
writeFileSync(join(pub, "favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await crop(PEAK, size) })))));
// Browsers that prefer the SVG icon get the peak too, as an embedded 64 px PNG.
const peak64 = (await crop(PEAK, 64)).toString("base64");
writeFileSync(
  join(pub, "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${peak64}"/></svg>\n`
);
console.log("badge and favicons written to public/");
