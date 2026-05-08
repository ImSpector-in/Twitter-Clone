import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getFollowing } from '@/lib/queries/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import FollowButton from '@/components/profile/FollowButton'

type Props = { params: Promise<{ username: string }> }

export default async function FollowingPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if viewer can see this list
  const isOwnProfile = user?.id === profile.id
  if (profile.is_private && !isOwnProfile) {
    const { data: follow } = await supabase.from('follows').select('follower_id').eq('follower_id', user!.id).eq('following_id', profile.id).single()
    if (!follow) return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        This account is private.
      </div>
    )
  }

  const following = await getFollowing(profile.id)

  const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', user!.id)
  const followingSet = new Set(myFollows?.map((f) => f.following_id) ?? [])

  return (
    <div>
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Link href={`/profile/${username}`} className="p-1 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold">Following</h2>
          <p className="text-muted-foreground text-sm">@{username}</p>
        </div>
      </div>
      {following.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">Not following anyone yet.</div>
      ) : (
        <ul>
          {following.map((f: any) => {
            const displayName = f.display_name || f.username
            return (
              <li key={f.id} className="flex items-center justify-between border-b px-4 py-3 hover:bg-muted/30 transition-colors">
                <Link href={`/profile/${f.username}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{displayName}</p>
                    <p className="text-muted-foreground text-sm">@{f.username}</p>
                  </div>
                </Link>
                {f.id !== user!.id && (
                  <FollowButton targetUserId={f.id} targetUsername={f.username} initialIsFollowing={followingSet.has(f.id)} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
