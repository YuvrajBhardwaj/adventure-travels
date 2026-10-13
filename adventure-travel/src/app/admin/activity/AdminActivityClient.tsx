"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { ThemeScope } from "@/components/ui/theme-scope";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function AdminActivityClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Cosmetic gate only — the real enforcement is the RLS policy on activity_logs.
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <ThemeScope>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <header className="mb-6 pr-12">
          <h1 className="font-heading text-3xl font-bold">Activity</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Who signed up and what they did, newest first.
          </p>
        </header>

        {loading || !user ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : !isAdmin ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <ShieldAlert className="h-8 w-8 text-amber-500" aria-hidden />
              <p className="font-semibold">Admin access required</p>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                This page is only for the business admin account.
              </p>
              <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ActivityFeed />
        )}
      </main>
    </ThemeScope>
  );
}
