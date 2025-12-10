"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const ThemeIcon = ({ theme }: { theme: string | undefined }) => {
  const Icon = theme === "dark" ? Sun : Moon
  return <Icon className="w-6 h-6" />
}

const MobileThemeToggle = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="md:hidden fixed top-6 right-6 z-50 text-foreground hover:text-foreground/80 transition-colors"
    aria-label="Toggle dark mode"
  >
    <ThemeIcon theme={useTheme().theme} />
  </button>
)

const DesktopThemeToggle = ({ onClick, theme }: { onClick: () => void; theme: string | undefined }) => (
  <div className="hidden md:block fixed bottom-6 right-6 z-50">
    <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/30 dark:bg-white/30 animate-ping" />
    <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-tr from-primary/50 to-primary/20 dark:from-white/50 dark:to-white/20 blur-sm animate-pulse" />
    <button
      onClick={onClick}
      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 dark:from-white dark:via-gray-50 dark:to-gray-100 backdrop-blur-md text-white dark:text-black shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center hover:scale-110 hover:rotate-12 border-2 border-white/20 dark:border-black/10"
      aria-label="Toggle dark mode"
    >
      <ThemeIcon theme={theme} />
    </button>
  </div>
)

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  if (!mounted) return <main className="w-full min-h-screen">{children}</main>

  return (
    <>
      <main className="w-full min-h-screen">{children}</main>
      <MobileThemeToggle onClick={toggleTheme} />
      <DesktopThemeToggle onClick={toggleTheme} theme={theme} />
    </>
  )
}
