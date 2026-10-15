"use client";

import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { AdminGate } from "@/components/admin/AdminGate";

export default function AdminActivityClient() {
  return (
    <AdminGate title="Activity" description="Who signed up and what they did, newest first.">
      <ActivityFeed />
    </AdminGate>
  );
}
