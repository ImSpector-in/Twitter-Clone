import { TrendingUp } from 'lucide-react'
import { getHackerNews, getTradingNews, getHopecoreNews } from '@/lib/queries/trending'
import NewsTabs from '@/components/trending/NewsTabs'

export default async function TrendingPage() {
  const [hackerNews, tradingNews, hopecoreNews] = await Promise.all([
    getHackerNews(),
    getTradingNews(),
    getHopecoreNews(),
  ])

  return (
    <div>
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2 mb-0.5">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Trending</h2>
        </div>
        <p className="text-muted-foreground text-sm">What&apos;s happening in the world right now</p>
      </div>
      <div className="px-4 py-4">
        <NewsTabs
          hackerNews={hackerNews}
          tradingNews={tradingNews}
          hopecoreNews={hopecoreNews}
        />
      </div>
    </div>
  )
}
