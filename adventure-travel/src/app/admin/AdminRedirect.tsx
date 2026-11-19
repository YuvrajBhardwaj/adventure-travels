"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Static export has no server redirects: send /admin on to the bookings list after mount.
export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/admin/bookings"), [router]);
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-navy px-4 text-white">
      <Link href="/admin/bookings" className="underline underline-offset-4">Go to admin bookings</Link>
    </main>
  );
}
