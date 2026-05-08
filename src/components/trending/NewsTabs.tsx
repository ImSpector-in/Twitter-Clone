'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { NewsItem } from '@/lib/queries/trending'

type Tab = 'hacker' | 'trading' | 'hopecore'

type Props = {
  hackerNews: NewsItem[]
  tradingNews: NewsItem[]
  hopecoreNews: NewsItem[]
}

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: 'hacker', label: 'Hacker News', emoji: '💻' },
  { id: 'trading', label: 'Trading', emoji: '📈' },
  { id: 'hopecore', label: 'Hopecore', emoji: '🌟' },
]

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 px-4 py-3 border-b hover:bg-muted/30 transition-colors group"
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        {item.pubDate && (
          <p className="text-xs text-muted-foreground">
            {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  )
}

export default function NewsTabs({ hackerNews, tradingNews, hopecoreNews }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('hacker')

  const feeds: Record<Tab, NewsItem[]> = {
    hacker: hackerNews,
    trading: tradingNews,
    hopecore: hopecoreNews,
  }

  const items = feeds[activeTab]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b">
        {tabs.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${
              activeTab === id ? 'border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* News items */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          Could not load news right now. Try again later.
        </div>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <NewsCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
