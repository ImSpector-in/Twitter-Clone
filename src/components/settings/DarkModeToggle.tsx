'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  function handleToggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        {isDark ? <Moon className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" /> : <Sun className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />}
        <div>
          <p className="font-medium text-sm">Dark mode</p>
          <p className="text-muted-foreground text-sm">{isDark ? 'Currently using dark theme.' : 'Currently using light theme.'}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isDark ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
