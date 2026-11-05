import type { Trek } from "./treks";

/**
 * Each trek's own photos and videos, shot on our departures (served web-sized from public/assets).
 * Trek pages use them for the hero slideshow and the Photo Gallery tab; photo cards cycle through them.
 */
export const TREK_GALLERIES: Record<string, string[]> = {
  "valley-of-flowers": [
    "/assets/valley-of-flowers/IMG_5934.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_1532.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_4735.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6644.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6639.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6626.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6080.JPG.jpeg",
    "/assets/valley-of-flowers/IMG_6061.JPG.jpeg",
  ],
  "satopanth-lake": [
    "/assets/satopanth-lake/IMG_4732.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4733.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4746.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4748.JPG.jpeg",
    "/assets/satopanth-lake/IMG_4752.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5914.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5925.JPG.jpeg",
    "/assets/satopanth-lake/IMG_5931.JPG.jpeg",
  ],
  "hampta-pass": [
    "/assets/hampta-pass/IMG_7578.jpeg",
    "/assets/hampta-pass/IMG_7579.jpeg",
    "/assets/hampta-pass/IMG_7580.jpeg",
    "/assets/hampta-pass/IMG_7581.jpeg",
  ],
  kedarkantha: [
    "/assets/kedarkantha-trek/IMG_1267.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1268.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1269.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_1270.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4137.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4139.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4141.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4142.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4143.JPG.jpeg",
    "/assets/kedarkantha-trek/IMG_4144.JPG.jpeg",
  ],
  "har-ki-dun": [
    "/assets/har-ki-dun/0438a440-d8ea-4b76-bdae-881663d56e4d.jpeg",
    "/assets/har-ki-dun/06287674-b8df-4057-80dc-eab46b75802d.jpeg",
    "/assets/har-ki-dun/106d5aac-9f53-4495-99c1-cb9b16a5dd01.jpeg",
    "/assets/har-ki-dun/411ba4ff-e5d5-4217-8964-77ff3584205e.jpeg",
    "/assets/har-ki-dun/5027dc2f-ce24-4537-b8d1-d401001a84c3.jpeg",
    "/assets/har-ki-dun/5027dc2f-ce24-4537-b8d1-d401001a84c3_1.jpeg",
    "/assets/har-ki-dun/7132cc37-803f-479f-8cdb-fc595552b3ed.jpeg",
    "/assets/har-ki-dun/e9a6b4b0-145b-4ce1-ba6c-7cd151231700.jpeg",
  ],
  "dronagiri-base-camp": [
    "/assets/dronagiri/3a7fecb4-cee0-4007-939b-817762df7e3f.jpeg",
    "/assets/dronagiri/56317364-2f86-46e4-8b57-3c989e2b39b5.jpeg",
    "/assets/dronagiri/7155162a-d858-4534-901f-e67b9acfe491.jpeg",
    "/assets/dronagiri/85943898-e5e5-4bb4-93b0-84cd940cd6b6.jpeg",
    "/assets/dronagiri/c3de05f4-7486-4ad7-bd72-ee923d6f6831.jpeg",
    "/assets/dronagiri/220a92d7-c372-466f-b568-682143c3f75a.mov",
    "/assets/dronagiri/390992d1-bb16-456c-9696-2b7076d7e510 (1).mov",
    "/assets/dronagiri/da4bf970-c056-493f-9a0f-1f4a83a7227a.mov",
    "/assets/dronagiri/da933a63-a715-4cf8-a753-0b4bab45c6a7.mov",
    "/assets/dronagiri/fb97608f-889a-4473-a9c3-4206fddec5c4.mov",
  ],
  "pangarchula-peak": [
    "/assets/pangarchula-peak-trek/IMG_3734.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3735.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3737.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3741.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3746.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3747.jpeg",
    "/assets/pangarchula-peak-trek/IMG_3751.jpeg",
    "/assets/pangarchula-peak-trek/af2701a5-b67d-4691-af78-627834f8c0a8.jpeg",
    "/assets/pangarchula-peak-trek/0834c6e9-e382-426a-894b-6d7af316cda5.mp4",
  ],
  "nandi-kund": [
    "/assets/nandi-kund-trek/2c72f839-1d03-4194-829a-0cb0e953eb8a.jpeg",
    "/assets/nandi-kund-trek/32abfdc3-ad09-48a0-b15b-6da2e0d3dffc.jpeg",
    "/assets/nandi-kund-trek/5ea3adc5-d375-4a7f-ab3a-17224fcd463c.jpeg",
    "/assets/nandi-kund-trek/65a896f6-83b2-41aa-9726-171f369a2b12.jpeg",
    "/assets/nandi-kund-trek/74d946e2-9a04-4881-b830-0579948647b8.jpeg",
    "/assets/nandi-kund-trek/b0e62e4f-a4ec-40ce-9808-2ee87c0bf2cd.jpeg",
    "/assets/nandi-kund-trek/d39028ef-4d93-4a91-b087-2f40237fc124.jpeg",
    "/assets/nandi-kund-trek/feb980a9-026c-4e20-8207-d16c640983d6.mov",
  ],
  "panpatia-col": [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&q=80",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    "/assets/panpatia-col-trek/9ecb69c4-00c7-4116-a312-ad393182f10e.jpeg",
    "/assets/panpatia-col-trek/a8c14f1d-60a2-4e5a-b38b-17d5c74cfb9e.jpeg",
    "/assets/panpatia-col-trek/IMG_6013.jpeg",
    "/assets/panpatia-col-trek/IMG_6015.jpeg",
    "/assets/panpatia-col-trek/IMG_6059.jpeg",
    "/assets/panpatia-col-trek/IMG_6060.jpeg",
    "/assets/panpatia-col-trek/IMG_6079.jpeg",
    "/assets/panpatia-col-trek/Panpateya.mov",
  ],
  "kuari-pass": [
    "/assets/kuari-pass-trek/017bfe93-d6e9-4c29-841d-e55ba276be2b.jpeg",
    "/assets/kuari-pass-trek/1d41b58f-ea07-4213-b575-da947e8c33c0.jpeg",
    "/assets/kuari-pass-trek/340648ba-f46c-4dae-9ba6-d48a6a1d91f9.jpeg",
    "/assets/kuari-pass-trek/3a32bc72-b94d-46f5-a2b3-9a47fd31ffd1.jpeg",
    "/assets/kuari-pass-trek/43025720-b05f-48e4-91cd-9d6783d428b2.jpeg",
    "/assets/kuari-pass-trek/564c4289-af50-4c8b-be21-3e209be853cc.jpeg",
    "/assets/kuari-pass-trek/7d28235d-0d49-4998-9bc7-3304ad6c33e2.jpeg",
    "/assets/kuari-pass-trek/7ec049fb-c7cd-4864-8489-01856a209ae0.jpeg",
    "/assets/kuari-pass-trek/886a82c1-6760-4244-9124-ac856341552c.jpeg",
    "/assets/kuari-pass-trek/8a7f3f68-76f9-4945-98cc-8734fc98063c.jpeg",
    "/assets/kuari-pass-trek/9f773586-9c67-460f-bdd5-30d7737e3c80.jpeg",
    "/assets/kuari-pass-trek/f7d8168c-15e8-4766-946e-74358e954af2.jpeg",
    "/assets/kuari-pass-trek/f14f4fc5-7c11-4e21-abcf-e12bf021e6dc.mov",
  ],
  "bhrigu-lake": [
    "/assets/birgu-lake/22e5257b-854d-4722-9ad9-4f63715455e0.jpeg",
    "/assets/birgu-lake/5c300a48-3471-4dc2-90d0-dce291830158.jpeg",
    "/assets/birgu-lake/64bc3481-a48c-41b4-953e-b53aa486c316.jpeg",
    "/assets/birgu-lake/6964c690-5520-4da2-8cc3-dffff4846b4c.jpeg",
    "/assets/birgu-lake/787e70f8-b61c-4f19-a2a7-551cadf0dc80.jpeg",
    "/assets/birgu-lake/cb3e743b-1cdd-4977-aa99-3f494072cb9a.jpeg",
    "/assets/birgu-lake/d4044abb-3f2d-4334-a52a-4048f82b359c.jpeg",
    "/assets/birgu-lake/d9f3c584-2fd9-497d-9ee0-a9c30ee52888.jpeg",
    "/assets/birgu-lake/3551faed-4e8b-48a1-8d7c-3009f2af7229.mov",
    "/assets/birgu-lake/96aa6578-8641-4b71-88af-a4892d9060f7.mov",
    "/assets/birgu-lake/9b1e5436-c884-4453-b06b-3c29651bbbcc.mov",
    "/assets/birgu-lake/c45c1e10-d795-4622-9afe-9aa19b3b325c.mov",
  ],
};

const isVideo = (src: string) => /\.(mp4|mov)$/i.test(src);

/** A trek's photos for a card slideshow: the cover first, then its own photos (no videos, no stock). */
export function trekPhotos(trek: Pick<Trek, "slug" | "image">, max = 6): string[] {
  const own = (TREK_GALLERIES[trek.slug] ?? []).filter((src) => !isVideo(src) && src.startsWith("/assets/"));
  const all = trek.image ? [trek.image, ...own.filter((src) => src !== trek.image)] : own;
  return all.slice(0, max);
}
