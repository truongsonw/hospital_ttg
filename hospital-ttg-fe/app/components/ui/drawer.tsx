"use client"

import * as React from "react"

import { cn } from "~/lib/utils"
import { XIcon } from "lucide-react"

interface SidePanelContextValue {
  open: boolean
  panelRef: React.RefObject<HTMLDialogElement | null>
}

const SidePanelContext = React.createContext<SidePanelContextValue | null>(null)

function useSidePanelContext() {
  const ctx = React.useContext(SidePanelContext)
  if (!ctx) throw new Error("SidePanel components must be used within SidePanel")
  return ctx
}

function SidePanel({
  open,
  onOpenChange,
  children,
  className,
  ...props
}: React.ComponentProps<"dialog"> & {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
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
      data-slot="side-panel"
      className={cn(
        "side-panel fixed inset-y-0 left-auto right-0 z-50 m-0 hidden h-full min-h-screen w-full max-w-none translate-x-0 flex-col border-0 bg-popover p-0 text-popover-foreground shadow-none outline-none ring-0 backdrop:bg-black/10 open:flex open:animate-in open:fade-in-0 open:slide-in-from-right-full open:duration-300 open:[animation-fill-mode:backwards] supports-backdrop-filter:backdrop-blur-xs data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-full data-closed:duration-200",
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false)
      }}
      {...props}
    >
      <SidePanelContext.Provider value={{ open, panelRef: dialogRef }}>
        {children}
      </SidePanelContext.Provider>
    </dialog>
  )
}

function SidePanelClose({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = useSidePanelContext()
  return (
    <button
      type="button"
      data-slot="side-panel-close"
      className={cn(
        "absolute right-3 top-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      onClick={() => ctx.open && ctx.panelRef.current?.close()}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Đóng</span>
    </button>
  )
}

function SidePanelHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-header"
      className={cn("flex flex-col gap-1 border-b px-6 py-4", className)}
      {...props}
    />
  )
}

function SidePanelFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function SidePanelTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="side-panel-title"
      className={cn("font-heading text-base font-medium leading-none", className)}
      {...props}
    />
  )
}

function SidePanelDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="side-panel-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// Legacy alias – keeps existing consumers working without import changes
const Drawer = SidePanel
const DrawerClose = SidePanelClose
const DrawerHeader = SidePanelHeader
const DrawerFooter = SidePanelFooter
const DrawerTitle = SidePanelTitle
const DrawerDescription = SidePanelDescription

export {
  SidePanel,
  SidePanelClose,
  SidePanelHeader,
  SidePanelFooter,
  SidePanelTitle,
  SidePanelDescription,
  Drawer,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
