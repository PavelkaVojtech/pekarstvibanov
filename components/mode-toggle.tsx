"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

type ViewTransition = {
  ready: Promise<void>
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark"
    const nextTheme = isDark ? "light" : "dark"

    const startViewTransition = (document as unknown as DocumentWithViewTransition)
      .startViewTransition?.bind(document)

    if (!startViewTransition) {
      setTheme(nextTheme)
      return
    }

    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )

    const transition = startViewTransition(() => {
      setTheme(nextTheme)
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    })
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="opacity-50">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Načítání...</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-foreground hover:text-primary hover:bg-accent transition-colors"
      aria-label="Přepnout téma"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}