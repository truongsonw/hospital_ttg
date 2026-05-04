"use client"

import * as React from "react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"

function AlertDialog({
  open,
  onOpenChange,
  children,
}: React.ComponentProps<"dialog"> & {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) el.showModal()
    else el.close()
  }, [open])

  React.useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handleClose = () => onOpenChange(false)
    el.addEventListener("close", handleClose)
    return () => el.removeEventListener("close", handleClose)
  }, [onOpenChange])

  return (
    <dialog
      ref={dialogRef}
      data-slot="alert-dialog"
      className={cn(
        "alert-dialog fixed left-1/2 top-1/2 z-50 m-0 -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 text-popover-foreground open:grid open:max-w-[calc(100%-2rem)] open:gap-4 open:rounded-xl open:bg-popover open:p-4 open:text-sm open:ring-1 open:ring-foreground/10 open:duration-100 open:data-[state=open]:animate-in open:data-[state=open]:fade-in-0 open:data-[state=open]:zoom-in-95 open:data-[state=closed]:animate-out open:data-[state=closed]:fade-out-0 open:data-[state=closed]:zoom-out-95 sm:open:max-w-sm",
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false)
      }}
    >
      {children}
    </dialog>
  )
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<"button">) {
  return <button type="button" data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-40 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  size = "default",
  open,
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  open: boolean
}) {
  if (!open) return null
  return (
    <>
      <AlertDialogOverlay />
      <div
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10",
          "sm:max-w-sm",
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({ className, variant, size, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-cancel"
      variant={variant ?? "outline"}
      size={size ?? "default"}
      className={cn(className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
}
