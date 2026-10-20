"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert">
      <EmptyState
        tone="amber"
        icon={<AlertTriangle />}
        title="Couldn't load this list."
        description="Check that all the SQL files in adventure-travel/ have been run and that your account has the admin role."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
