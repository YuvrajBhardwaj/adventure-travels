import { createClient } from "@/lib/supabase/client";

export type ActivityAction =
  | "SIGNUP"
  | "LOGIN"
  | "BOOKING_CREATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "SETTINGS_UPDATE"
  | "COURSE_BOOKING_CREATED"
  | "ADMIN_STATUS_CHANGE";

/** The only events a browser may write (enforced by RLS). SIGNUP and PAYMENT_* are server-side. */
export type ClientActivityAction = "LOGIN" | "BOOKING_CREATED" | "SETTINGS_UPDATE";

export type ActivityMetadata = Record<string, unknown>;

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityAction;
  metadata: ActivityMetadata;
  created_at: string;
  profiles: { full_name: string } | null;
}

async function send(actionType: ClientActivityAction, metadata: ActivityMetadata) {
  const supabase = createClient();
  if (!supabase) return; // local-account mode: nothing to log to
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("activity_logs").insert({
    user_id: session.user.id,
    action_type: actionType,
    metadata: {
      ...metadata,
      path: window.location.pathname,
      userAgent: navigator.userAgent.slice(0, 200),
    },
  });
}

/**
 * Fire-and-forget: returns immediately and never throws, so tracking can't slow
 * down or break the action that triggered it. Server-originated events (signup,
 * payments) are written by the database trigger / API functions instead.
 */
export function trackActivity(actionType: ClientActivityAction, metadata: ActivityMetadata = {}) {
  if (typeof window === "undefined") return;
  void send(actionType, metadata).catch(() => {});
}
