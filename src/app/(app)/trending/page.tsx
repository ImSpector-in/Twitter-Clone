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
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Trending</h2>
        <p className="text-muted-foreground text-sm">What&apos;s happening in the world right now</p>
      </div>
      <NewsTabs
        hackerNews={hackerNews}
        tradingNews={tradingNews}
        hopecoreNews={hopecoreNews}
      />
    </div>
  )
}
