"use client"

import * as React from "react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { XIcon } from "lucide-react"

interface DialogContextValue {
  open: boolean
  dialogRef: React.RefObject<HTMLDialogElement | null>
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used within Dialog")
  return ctx
}

function Dialog({
  open,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<"dialog"> & {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      el.showModal()
    } else {
      el.close()
    }
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
      data-slot="dialog"
      className={cn(
        "dialog fixed left-1/2 top-1/2 z-50 m-0 -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 text-popover-foreground open:grid open:max-w-[calc(100%-2rem)] open:gap-4 open:rounded-xl open:bg-popover open:p-4 open:text-sm open:ring-1 open:ring-foreground/10 open:duration-100 open:data-[state=open]:animate-in open:data-[state=open]:fade-in-0 open:data-[state=open]:zoom-in-95 open:data-[state=closed]:animate-out open:data-[state=closed]:fade-out-0 open:data-[state=closed]:zoom-out-95 sm:open:max-w-sm",
        props.className as string
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          onOpenChange(false)
        }
      }}
      {...props}
    >
      <DialogContext.Provider value={{ open, dialogRef }}>
        {children}
      </DialogContext.Provider>
    </dialog>
  )
}

function DialogTrigger({ ...props }: React.ComponentProps<"button">) {
  return <button type="button" data-slot="dialog-trigger" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<"button">) {
  const ctx = useDialogContext()
  return (
    <button
      type="button"
      data-slot="dialog-close"
      onClick={() => ctx.open && ctx.dialogRef.current?.close()}
      {...props}
    />
  )
}

function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const ctx = useDialogContext()
  if (!ctx.open) return null
  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-40 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const ctx = useDialogContext()
  return (
    <div
      data-slot="dialog-content"
      className={cn("relative", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          data-slot="dialog-close"
          className="absolute top-2 right-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => ctx.open && ctx.dialogRef.current?.close()}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Đóng</span>
        </button>
      )}
    </div>
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

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
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
  DialogTitle,
  DialogTrigger,
}
