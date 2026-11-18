import { Suspense } from "react";
import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout", // the root layout adds " | Himalayan Arc Adventure"
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // useSearchParams() needs a Suspense boundary in a statically exported page.
  return (
    <Suspense fallback={null}>
      <CheckoutClient />
    </Suspense>
  );
}
