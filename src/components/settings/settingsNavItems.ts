import { User, Palette, Lock, Bell, Ban, VolumeX, Shield, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type SettingsNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const settingsNavItems: SettingsNavItem[] = [
  { href: '/settings/account', label: 'Account', icon: User },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/settings/privacy', label: 'Privacy', icon: Lock },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/blocked', label: 'Blocked accounts', icon: Ban },
  { href: '/settings/muted', label: 'Muted', icon: VolumeX },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/data', label: 'Your data', icon: Download },
]
