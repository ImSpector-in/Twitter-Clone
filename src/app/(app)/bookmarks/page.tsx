import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBookmarkedTweets } from '@/lib/queries/tweets'
import TweetList from '@/components/tweet/TweetList'

export const metadata: Metadata = { title: 'Bookmarks · Quotora' }

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tweets = await getBookmarkedTweets(user!.id)

  return (
    <div>
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold">Bookmarks</h2>
          <p className="text-muted-foreground text-sm">Tweets you&apos;ve saved</p>
        </div>
      </div>
      <TweetList
        tweets={tweets}
        currentUserId={user!.id}
        emptyMessage="No bookmarks yet."
        emptyAction={{ label: 'Explore tweets to bookmark', href: '/home' }}
      />
    </div>
  )
}
