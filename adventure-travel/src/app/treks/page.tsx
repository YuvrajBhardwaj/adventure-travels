import { pageMetadata } from "@/lib/seo";
import TreksPageClient from "./TreksPageClient";

export const metadata = pageMetadata({
  title: "Trek Packages in Uttarakhand & Himachal Pradesh",
  description:
    "Browse 20+ guided Himalayan treks in Uttarakhand and Himachal Pradesh. Filter by difficulty, duration, and price. Kedarkantha, Valley of Flowers, Hampta Pass, Brahmatal and more.",
  socialTitle: "Trek Packages | Himalayan Arc Adventure",
  socialDescription: "Browse guided Himalayan treks in Uttarakhand & Himachal Pradesh. Filter by difficulty, duration, and price.",
  path: "/treks",
});

export default function TreksPage() {
  return <TreksPageClient />;
}
