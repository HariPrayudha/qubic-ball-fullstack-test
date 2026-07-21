"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/** How long a toast stays on screen; the progress bar animation matches this. */
const TOAST_DURATION = 4000

const Toaster = ({ duration = TOAST_DURATION, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={duration}
      offset={20}
      gap={12}
      icons={{
        success: (
          <CircleCheckIcon className="size-5" />
        ),
        info: (
          <InfoIcon className="size-5" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5" />
        ),
        error: (
          <OctagonXIcon className="size-5" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" />
        ),
      }}
      style={
        {
          // Solid charcoal surface: reads clearly against the light app
          // background, with the type conveyed by icon + progress-bar colour.
          "--normal-bg": "oklch(0.216 0.006 56.043)",
          "--normal-text": "oklch(0.985 0.001 106.423)",
          "--normal-border": "oklch(1 0 0 / 12%)",
          "--border-radius": "var(--radius)",
          "--width": "380px",
          // Keeps the CSS progress-bar animation in sync with the toast duration.
          "--toast-progress-duration": `${duration}ms`,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
