// Builds the photos the website serves from the originals: at most 1600px on the long
// side, a small "© Himalayan Arc Adventure" mark in the corner, and no metadata (camera,
// GPS). Originals live in ../media-originals/ (git-ignored) so the site never publishes
// full-resolution files. Safe to re-run: it always rebuilds from the originals.
//
//   node scripts/prepare-photos.mjs           process every photo in public/assets
//   node scripts/prepare-photos.mjs --check   self-check only, changes nothing
//
// New photos: drop them into public/assets/<trek>/ as usual, then run this once.
import sharp from "sharp";
import assert from "node:assert/strict";
import { access, copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(APP, "public", "assets");
const ORIGINALS = path.join(APP, "..", "media-originals", "assets");
const MAX = 1600;
const MARK = "© Himalayan Arc Adventure";
const PHOTO = /\.(jpe?g|png|webp)$/i;
// Saved sideways by the phone, with no orientation tag to fix it automatically.
const ROTATE = { "panpatia-col-trek/IMG_6013.jpeg": 90, "panpatia-col-trek/IMG_6015.jpeg": 90 };

const exists = (p) => access(p).then(() => true, () => false);

function watermark(width, height) {
  const size = Math.max(14, Math.round(width * 0.022));
  const pad = Math.round(width * 0.025);
  const text = (dx, fill, opacity) =>
    `<text x="${width - pad + dx}" y="${height - pad + dx}" text-anchor="end" fill="${fill}" fill-opacity="${opacity}">${MARK}</text>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<style>text{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:${size}px;font-weight:600}</style>` +
      text(1, "#000", 0.35) +
      text(0, "#fff", 0.78) +
      `</svg>`
  );
}

/** Original (path or buffer) → web-sized, watermarked, metadata-free image buffer. */
async function transform(input, rel, ext) {
  const turn = ROTATE[rel];
  const resized = await sharp(input)
    .rotate(turn) // no angle = upright from the EXIF tag
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = resized.info;
  const out = sharp(resized.data).composite([{ input: watermark(width, height), top: 0, left: 0 }]);
  const encoded = /png$/i.test(ext) ? out.png({ compressionLevel: 9 }) : /webp$/i.test(ext) ? out.webp({ quality: 80 }) : out.jpeg({ quality: 80, mozjpeg: true });
  return encoded.toBuffer({ resolveWithObject: true });
}

async function* walk(dir, base = dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, base);
    else if (PHOTO.test(entry.name)) yield path.relative(base, full).split(path.sep).join("/");
  }
}

async function selfCheck() {
  const big = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#3a6" } }).jpeg().toBuffer();
  const { info } = await transform(big, "check.jpeg", ".jpeg");
  assert.equal(info.width, 1600);
  assert.equal(info.height, 1067);
  const small = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#36a" } }).jpeg().toBuffer();
  assert.equal((await transform(small, "small.jpeg", ".jpeg")).info.width, 800, "never enlarges");
  const turned = await transform(big, "panpatia-col-trek/IMG_6013.jpeg", ".jpeg");
  assert.equal(turned.info.width, 1067, "sideways photos are turned upright");
  assert.ok(watermark(1600, 1000).toString().includes(MARK));
  console.log("self-check passed");
}

async function main() {
  await selfCheck();
  if (process.argv.includes("--check")) return;

  let before = 0;
  let after = 0;
  let count = 0;
  for await (const rel of walk(ASSETS)) {
    const pub = path.join(ASSETS, rel);
    const orig = path.join(ORIGINALS, rel);
    // First run: the file in public/ IS the original, so keep it before overwriting.
    if (!(await exists(orig))) {
      await mkdir(path.dirname(orig), { recursive: true });
      await copyFile(pub, orig);
    }
    const { data } = await transform(orig, rel, path.extname(rel));
    await sharp(data).toFile(pub);
    before += (await stat(orig)).size;
    after += data.length;
    count++;
  }
  const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
  console.log(`${count} photos: ${mb(before)} of originals → ${mb(after)} served. Originals in ${path.relative(APP, ORIGINALS)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
