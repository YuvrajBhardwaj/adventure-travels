"use client";

import { useEffect } from "react";

/**
 * Casual copy deterrents: no right-click menu, no image/video drag-save,
 * no common inspect / view-source / save-page shortcuts.
 *
 * Deterrence only — anything served to a browser can still be fetched
 * directly, so this is a speed bump, not a vault.
 */
export default function AssetProtection() {
  useEffect(() => {
    const editable = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

    const onContextMenu = (e: MouseEvent) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c", "k"].includes(k)) ||
        ((e.ctrlKey || e.metaKey) && ["u", "s"].includes(k))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
