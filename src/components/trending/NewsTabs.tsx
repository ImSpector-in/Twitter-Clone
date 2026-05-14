'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown, MessageSquare, Repeat2, Share2, Bookmark, LayoutGrid, TrendingUp, Sun } from 'lucide-react'
import type { NewsItem } from '@/lib/queries/trending'

type Tab = 'hacker' | 'trading' | 'hopecore'

type Props = {
  hackerNews: NewsItem[]
  tradingNews: NewsItem[]
  hopecoreNews: NewsItem[]
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'hacker', label: 'Hacker News', Icon: LayoutGrid },
  { id: 'trading', label: 'Trading', Icon: TrendingUp },
  { id: 'hopecore', label: 'Hopecore', Icon: Sun },
]

const KNOWN_COLORS: Record<string, string> = {
  'github.com': 'bg-gray-400',
  'reddit.com': 'bg-orange-500',
  'old.reddit.com': 'bg-orange-500',
  'news.ycombinator.com': 'bg-orange-500',
  'nbcnews.com': 'bg-blue-500',
  'bbc.com': 'bg-red-500',
  'bbc.co.uk': 'bg-red-500',
  'marketwatch.com': 'bg-green-500',
  'bloomberg.com': 'bg-blue-600',
  'techcrunch.com': 'bg-green-400',
  'goodnewsnetwork.org': 'bg-yellow-400',
  'reuters.com': 'bg-orange-400',
  'theverge.com': 'bg-purple-500',
  'wired.com': 'bg-gray-500',
  'arstechnica.com': 'bg-red-600',
}

const FALLBACK_COLORS = [
  'bg-teal-500', 'bg-pink-500', 'bg-violet-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-blue-500', 'bg-fuchsia-500', 'bg-cyan-500',
]

function getDomainColor(domain: string): string {
  if (KNOWN_COLORS[domain]) return KNOWN_COLORS[domain]
  let hash = 0
  for (let i = 0; i < domain.length; i++) hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}

function getSourceDomain(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function truncateUrl(link: string): string {
  try {
    const url = new URL(link)
    const full = url.hostname.replace(/^www\./, '') + url.pathname
    return full.length > 52 ? full.slice(0, 52) + '…' : full
  } catch {
    return link.slice(0, 52)
  }
}

function formatPubDate(pubDate: string): string {
  const d = new Date(pubDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const domain = getSourceDomain(item.link)
  const dotColor = getDomainColor(domain)
  // Use real score if available (HN), otherwise derive a deterministic fallback
  const score = item.score ?? Math.max(4, 180 - index * 9)

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-3 hover:border-primary/30 transition-all">
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 w-9 pt-0.5">
          <button className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded">
            <ArrowUp className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold tabular-nums leading-none py-0.5">{score}</span>
          <button className="text-muted-foreground hover:text-muted-foreground/50 transition-colors p-0.5 rounded">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Source + timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
            <span className="font-medium text-foreground/80">{domain}</span>
            {item.pubDate && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatPubDate(item.pubDate)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block font-semibold text-[15px] leading-snug hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {item.title}
          </a>

          {/* URL + comments thread */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 flex-wrap">
            <span className="truncate">{truncateUrl(item.link)}</span>
            {item.commentsLink && (
              <>
                <span className="text-muted-foreground/30 shrink-0">·</span>
                <a
                  href={item.commentsLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-primary hover:underline whitespace-nowrap shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  comments thread
                </a>
              </>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-0.5 pt-0.5 text-xs text-muted-foreground">
            {item.commentCount !== undefined && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-default">
                <MessageSquare className="h-3.5 w-3.5" />
                {item.commentCount}
              </span>
            )}
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-green-500/10 hover:text-green-400 transition-colors">
              <Repeat2 className="h-3.5 w-3.5" />
              Repost
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ml-auto">
              <Bookmark className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <div className="bg-card border border-border rounded-2xl p-1.5 mb-4 flex gap-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
          Could not load news right now. Try again later.
        </div>
      ) : (
        items.map((item, i) => <NewsCard key={i} item={item} index={i} />)
      )}
    </div>
  )
}
