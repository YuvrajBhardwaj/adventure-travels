"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeScope } from "@/components/ui/theme-scope";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/AdminNav";
import { cn } from "@/lib/utils";

/**
 * Shell for every /admin page: signed-out visitors go to /login, non-admins see a
 * notice. This is cosmetic — RLS (public.is_admin()) is what actually protects the data.
 */
export function AdminGate({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <ThemeScope>
      <main className={cn("mx-auto px-4 pb-16 pt-28", wide ? "max-w-6xl" : "max-w-3xl")}>
        <header className="mb-6 pr-12">
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
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
          <>
            <AdminNav />
            {children}
          </>
        )}
      </main>
    </ThemeScope>
  );
}
