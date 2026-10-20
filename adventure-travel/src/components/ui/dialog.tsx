"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { transition } from "@/lib/motion";

/**
 * shadcn-style Dialog on @radix-ui/react-dialog (research R2): focus trap,
 * focus return, Escape and outside-click close, scroll lock and aria-modal come
 * from Radix; enter/exit is framer-motion via forceMount + AnimatePresence, so
 * closing mid-animation reverses smoothly. Sheet (sheet.tsx) shares the root.
 */

type Tone = "auto" | "light" | "dark";

type DialogState = { open: boolean; setOpen: (open: boolean) => void };
const DialogStateContext = React.createContext<DialogState>({ open: false, setOpen: () => {} });
export const useDialogState = () => React.useContext(DialogStateContext);

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  const state = React.useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen]);
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogStateContext.Provider value={state}>{children}</DialogStateContext.Provider>
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold tracking-[-0.01em] text-slate-900 dark:text-white", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1 text-sm text-muted dark:text-white/60", className)} {...props} />;
}

/**
 * The portal renders under <body>, outside any ThemeScope/DarkScope. With
 * tone="auto" the overlay copies the dark class of wherever it is declared.
 */
export function useInheritedTone(tone: Tone, open: boolean) {
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const [inherited, setInherited] = React.useState(false);
  React.useLayoutEffect(() => {
    if (open && tone === "auto") setInherited(Boolean(anchorRef.current?.closest(".dark")));
  }, [open, tone]);
  return { anchorRef, dark: tone === "dark" || (tone === "auto" && inherited) };
}

export function DialogOverlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay asChild forceMount>
      <motion.div
        className={cn("fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-[2px]", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition("base", "inOut")}
      />
    </DialogPrimitive.Overlay>
  );
}

export function CloseButton({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn(
        "absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white",
        className
      )}
    >
      <X className="h-5 w-5" aria-hidden />
    </DialogPrimitive.Close>
  );
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  full: "h-full max-h-none w-full max-w-none rounded-none border-0 bg-transparent shadow-none dark:bg-transparent",
} as const;

type ContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "title" | "asChild" | "forceMount"
> & {
  /** Visible heading; omit it and place a <DialogTitle> yourself for a custom header. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Keeps the title for screen readers only. */
  hideTitle?: boolean;
  size?: keyof typeof SIZES;
  tone?: Tone;
  /** "bottom": rises from the bottom edge on phones, centred from `sm` up. */
  placement?: "center" | "bottom";
  hideClose?: boolean;
  closeClassName?: string;
};

export function DialogContent({
  title,
  description,
  hideTitle = false,
  size = "md",
  tone = "auto",
  placement = "center",
  hideClose = false,
  closeClassName,
  className,
  children,
  ...props
}: ContentProps) {
  const { open } = useDialogState();
  const reduce = useReducedMotion();
  const { anchorRef, dark } = useInheritedTone(tone, open);
  const offsetY = placement === "bottom" ? 32 : 8;

  return (
    <>
      <span ref={anchorRef} hidden />
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <div className={cn(dark && "dark")}>
              <DialogOverlay className={size === "full" ? "bg-slate-950/90 backdrop-blur-sm" : undefined} />
              <div
                className={cn(
                  "pointer-events-none fixed inset-0 z-[151] flex justify-center",
                  size === "full"
                    ? "items-stretch"
                    : placement === "bottom"
                      ? "items-end sm:items-center sm:p-6"
                      : "items-center p-4"
                )}
              >
                <DialogPrimitive.Content
                  asChild
                  forceMount
                  aria-describedby={description ? undefined : props["aria-describedby"]}
                  {...props}
                >
                  <motion.div
                    data-lenis-prevent
                    className={cn(
                      "pointer-events-auto relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] outline-none dark:border-white/10 dark:bg-navy-deep dark:text-white",
                      placement === "bottom" && size !== "full" && "max-h-[90dvh] rounded-b-none sm:rounded-b-2xl",
                      SIZES[size],
                      className
                    )}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: offsetY }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      reduce
                        ? { opacity: 0, transition: transition("base", "inOut") }
                        : { opacity: 0, scale: 0.98, y: offsetY / 2, transition: transition("base", "inOut") }
                    }
                    transition={transition("slow")}
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
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </>
  );
}
