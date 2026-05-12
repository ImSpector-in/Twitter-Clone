import { createClient } from '@/lib/supabase/server'
import { getTweetsByHashtag } from '@/lib/queries/tweets'
import TweetList from '@/components/tweet/TweetList'
import { Hash } from 'lucide-react'

type Props = {
  params: Promise<{ tag: string }>
}

export default async function HashtagPage({ params }: Props) {
  const { tag } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tweets = await getTweetsByHashtag(tag, user?.id)

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg">#{tag}</h1>
          <p className="text-muted-foreground text-sm">{tweets.length} tweet{tweets.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <TweetList
        tweets={tweets as any}
        currentUserId={user?.id ?? ''}
        emptyMessage={`No tweets with #${tag} yet.`}
      />
    </div>
  )
}
