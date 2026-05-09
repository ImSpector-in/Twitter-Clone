import Link from 'next/link'
import { ExternalLink, TrendingUp } from 'lucide-react'
import { getHackerNews, getTradingNews, getHopecoreNews } from '@/lib/queries/trending'

export default async function TrendingSidebar() {
  const [hacker, trading, hopecore] = await Promise.all([
    getHackerNews(),
    getTradingNews(),
    getHopecoreNews(),
  ])

  const sections = [
    { label: '💻 Tech', items: hacker.slice(0, 3) },
    { label: '📈 Markets', items: trading.slice(0, 2) },
    { label: '🌟 Good News', items: hopecore.slice(0, 2) },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-bold text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending
        </h3>
        <Link href="/trending" className="text-xs text-primary hover:underline">See all</Link>
      </div>
      <div className="divide-y">
        {sections.map(({ label, items }) => (
          items.length > 0 && (
            <div key={label} className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-2 group"
                >
                  <p className="text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )
        ))}
      </div>
      <div className="px-4 py-2 border-t">
        <Link href="/trending" className="text-sm text-primary hover:underline">
          Show more →
        </Link>
      </div>
    </div>
  )
}
