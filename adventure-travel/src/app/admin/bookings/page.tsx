import type { Metadata } from "next";
import BookingsAdminClient from "./BookingsAdminClient";

export const metadata: Metadata = {
  title: "Bookings | Admin",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <BookingsAdminClient />;
}
