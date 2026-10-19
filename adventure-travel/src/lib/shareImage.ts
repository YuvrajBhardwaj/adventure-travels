import { existsSync } from "node:fs";
import path from "node:path";

// Server-only (reads the file system at build time).

/**
 * Link-preview image props for pageMetadata(): `/og/<name>.jpg` when scripts/prepare-photos.mjs
 * has built it (1200×630 JPEG under WhatsApp's 300 KB limit), otherwise nothing, so the page
 * falls back to the site's default share image instead of a missing or oversized photo.
 */
export function shareImage(name: string) {
  return existsSync(path.join(process.cwd(), "public", "og", `${name}.jpg`))
    ? { image: `/og/${name}.jpg`, imageWidth: 1200, imageHeight: 630 }
    : {};
}
