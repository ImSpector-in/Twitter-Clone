import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTweetById, getReplies } from '@/lib/queries/tweets'
import TweetCard from '@/components/tweet/TweetCard'
import TweetComposer from '@/components/tweet/TweetComposer'
import TweetList from '@/components/tweet/TweetList'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function TweetThreadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tweet, replies] = await Promise.all([
    getTweetById(id, user!.id),
    getReplies(id, user!.id),
  ])

  if (!tweet) notFound()

  return (
    <div>
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-bold">Thread</h2>
      </div>

      {/* Original tweet */}
      <TweetCard tweet={tweet as any} currentUserId={user!.id} />

      {/* Reply composer */}
      <div className="border-b px-4 py-2">
        <TweetComposer
          replyToId={id}
          placeholder="Post your reply..."
          compact
        />
      </div>

      {/* Replies */}
      {replies.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No replies yet. Be the first to reply!
        </div>
      ) : (
        <TweetList
          tweets={replies as any}
          currentUserId={user!.id}
          emptyMessage="No replies yet."
        />
      )}
    </div>
  )
}
