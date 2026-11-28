"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { spring } from "@/components/motion/variants"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const sidebarAnimation = "duration-400 [animation-timing-function:ease-in-out] data-open:animate-in motion-reduce:duration-150"

function DialogOverlay({
  className,
  sidebar = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & { sidebar?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <DialogPrimitive.Overlay asChild {...props}>
      <motion.div
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 isolate z-50 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs data-closed:animate-out data-closed:fade-out-0",
          sidebar && cn(sidebarAnimation, "bg-black/50 data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-none"),
          className
        )}
        initial={sidebar ? false : { opacity: 0 }}
        animate={sidebar ? undefined : { opacity: 1 }}
        transition={{ duration: reduce ? 0.15 : 0.25, ease: "easeOut" }}
      />
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  children,
  overlayClassName,
  showCloseButton = true,
  placement = "center",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  placement?: "center" | "right"
}) {
  const reduce = useReducedMotion()
  const isRight = placement === "right"

  return (
    <DialogPortal>
      <DialogOverlay sidebar={isRight} />
      <DialogPrimitive.Content asChild {...props}>
        <motion.div
          data-slot="dialog-content"
          className={cn(
            "fixed z-50 w-full bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-200 outline-none data-closed:animate-out",
            isRight
              ? cn(sidebarAnimation, "inset-y-0 right-0 max-w-[40rem] overflow-y-auto rounded-l-xl overscroll-contain motion-safe:data-open:slide-in-from-right motion-safe:data-closed:slide-out-to-right motion-reduce:data-open:fade-in-0 motion-reduce:data-closed:fade-out-0")
              : "top-1/2 left-1/2 grid max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl sm:max-w-sm data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          initial={isRight ? false : reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
          animate={isRight ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={spring}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close data-slot="dialog-close" asChild>
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              >
                <XIcon
                />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-base leading-relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
