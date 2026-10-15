"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-amber-500" aria-hidden />
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
        Couldn&apos;t load this list. Check that all five SQL files have been run and that your account has the admin role.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
