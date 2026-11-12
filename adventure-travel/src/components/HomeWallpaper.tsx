import WallpaperCarousel, { type WallpaperSlide } from "@/components/WallpaperCarousel";
import { treks } from "@/data/treks";

// Our own landscape photos, one or two per route, captioned with the trek they were taken on.
const PHOTOS: { slug: string; src: string }[] = [
  { slug: "satopanth-lake", src: "/assets/satopanth-lake/IMG_5914.JPG.jpeg" },
  { slug: "pangarchula-peak", src: "/assets/pangarchula-peak-trek/IMG_3737.jpeg" },
  { slug: "panpatia-col", src: "/assets/panpatia-col-trek/9ecb69c4-00c7-4116-a312-ad393182f10e.jpeg" },
  { slug: "kuari-pass", src: "/assets/kuari-pass-trek/564c4289-af50-4c8b-be21-3e209be853cc.jpeg" },
  { slug: "dronagiri-base-camp", src: "/assets/dronagiri/c3de05f4-7486-4ad7-bd72-ee923d6f6831.jpeg" },
  { slug: "nandi-kund", src: "/assets/nandi-kund-trek/65a896f6-83b2-41aa-9726-171f369a2b12.jpeg" },
  { slug: "valley-of-flowers", src: "/assets/valley-of-flowers/IMG_5934.JPG.jpeg" },
  { slug: "satopanth-lake", src: "/assets/satopanth-lake/IMG_5931.JPG.jpeg" },
  { slug: "pangarchula-peak", src: "/assets/pangarchula-peak-trek/IMG_3734.jpeg" },
];

const SLIDES: WallpaperSlide[] = PHOTOS.flatMap(({ slug, src }) => {
  const trek = treks.find((t) => t.slug === slug);
  return trek ? [{ src, caption: `${trek.name} · ${trek.maxAltitude.toLocaleString("en-IN")} m`, href: `/treks/${slug}` }] : [];
});

/** Home page: a full-screen slideshow of our own trail photos, each linked to its trek. */
export default function HomeWallpaper() {
  return (
    <WallpaperCarousel
      slides={SLIDES}
      label="Photos from our treks"
      className="h-[88svh] min-h-[520px]"
      scrimClassName="bg-gradient-to-t from-black/70 via-black/10 to-black/45"
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <p className="font-nav text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">On the trail</p>
        <h2 className="mt-3 max-w-2xl font-heading text-4xl font-medium leading-[1.02] tracking-[-0.03em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] sm:text-6xl">
          Seen on our treks
        </h2>
        <p className="mt-3 max-w-md text-base text-white/85 [text-shadow:0_1px_14px_rgba(0,0,0,0.6)] sm:text-lg">
          Every photo here is ours, taken on the routes we run. Tap the name to open the trek.
        </p>
      </div>
    </WallpaperCarousel>
  );
}
