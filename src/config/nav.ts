import { Home, Search, Bell, TrendingUp, Bookmark, User, Settings, MessageSquare } from 'lucide-react'

export const NAV_ITEMS = (username: string) => [
  { href: '/home',                    label: 'Home',          icon: Home },
  { href: '/discover',                label: 'Search',        icon: Search },
  { href: '/notifications',           label: 'Notifications', icon: Bell },
  { href: '/messages',                label: 'Messages',      icon: MessageSquare },
  { href: '/trending',                label: 'Trending',      icon: TrendingUp },
  { href: '/bookmarks',               label: 'Bookmarks',     icon: Bookmark },
  { href: `/profile/${username}`,     label: 'Profile',       icon: User },
  { href: '/settings',               label: 'Settings',      icon: Settings },
]
