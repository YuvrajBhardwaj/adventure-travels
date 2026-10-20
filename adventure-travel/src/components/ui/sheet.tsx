"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING, transition } from "@/lib/motion";
import {
  CloseButton,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  useDialogState,
  useInheritedTone,
} from "./dialog";

/** Edge drawer: the Dialog primitive, slid in with the sheet spring. */
export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;

type Side = "right" | "left" | "bottom";

const SIDES: Record<Side, string> = {
  right: "inset-y-0 right-0 h-full w-[min(88vw,420px)] rounded-l-2xl border-l",
  left: "inset-y-0 left-0 h-full w-[min(88vw,420px)] rounded-r-2xl border-r",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-2xl border-t",
};

const OFFSCREEN: Record<Side, { x?: string; y?: string }> = {
  right: { x: "100%" },
  left: { x: "-100%" },
  bottom: { y: "100%" },
};

type SheetContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "title" | "asChild" | "forceMount"
> & {
  side?: Side;
  title?: React.ReactNode;
  description?: React.ReactNode;
  hideTitle?: boolean;
  tone?: "auto" | "light" | "dark";
  hideClose?: boolean;
  closeClassName?: string;
  /** Drag toward the edge to close (left/right sheets). */
  swipeToClose?: boolean;
};

export function SheetContent({
  side = "right",
  title,
  description,
  hideTitle = false,
  tone = "auto",
  hideClose = false,
  closeClassName,
  swipeToClose = false,
  className,
  children,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useDialogState();
  const reduce = useReducedMotion();
  const { anchorRef, dark } = useInheritedTone(tone, open);
  const canDrag = swipeToClose && !reduce && side !== "bottom";

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const toward = side === "right" ? info.offset.x : -info.offset.x;
    const speed = side === "right" ? info.velocity.x : -info.velocity.x;
    if (toward > 80 || speed > 500) setOpen(false);
  };

  return (
    <>
      <span ref={anchorRef} hidden />
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <div className={cn(dark && "dark")}>
              <DialogOverlay />
              <DialogPrimitive.Content
                asChild
                forceMount
                aria-describedby={description ? undefined : props["aria-describedby"]}
                {...props}
              >
                <motion.div
                  data-lenis-prevent
                  className={cn(
                    "fixed z-[151] flex flex-col overflow-y-auto overscroll-contain border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] outline-none dark:border-white/10 dark:bg-navy-deep dark:text-white",
                    SIDES[side],
                    className
                  )}
                  initial={reduce ? { opacity: 0 } : OFFSCREEN[side]}
                  animate={reduce ? { opacity: 1 } : { x: 0, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { ...OFFSCREEN[side], transition: transition("slow", "inOut") }}
                  transition={reduce ? transition("base") : SPRING.sheet}
                  drag={canDrag ? "x" : false}
                  dragDirectionLock
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={side === "right" ? { left: 0, right: 0.6 } : { left: 0.6, right: 0 }}
                  onDragEnd={canDrag ? onDragEnd : undefined}
                >
                  {title &&
                    (hideTitle ? (
                      <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                    ) : (
                      <div className="px-6 pb-2 pr-14 pt-6">
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                      </div>
                    ))}
                  {description && hideTitle && (
                    <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
                  )}
                  {children}
                  {!hideClose && <CloseButton className={closeClassName} />}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </>
  );
}
