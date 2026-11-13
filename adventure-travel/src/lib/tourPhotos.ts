import fs from "node:fs";
import path from "node:path";

/** Folder under public/assets/tours/ for each tour slug. */
export const TOUR_PHOTO_FOLDERS: Record<string, string> = {
  "auli-winter-escape": "auli",
  "chopta-tungnath": "tungnath",
};

/**
 * The owner's photos for a tour, read from public/assets/tours/<folder>/ at build time, so
 * dropping photos in (then `node scripts/prepare-photos.mjs`) is all it takes. Server-only:
 * call it from server components (the tour pages and /tours), never from client code.
 */
export function tourPhotos(slug: string): string[] {
  const folder = TOUR_PHOTO_FOLDERS[slug];
  if (!folder) return [];
  const dir = path.join(process.cwd(), "public", "assets", "tours", folder);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/assets/tours/${folder}/${f}`);
  } catch {
    return [];
  }
}
