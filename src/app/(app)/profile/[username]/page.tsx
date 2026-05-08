import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getTweetsByUserId, getFollowCounts } from '@/lib/queries/profile'
import { attachLikedBy } from '@/lib/queries/tweets'
import ProfileHeader from '@/components/profile/ProfileHeader'
import FollowButton from '@/components/profile/FollowButton'
import BlockMuteButtons from '@/components/profile/BlockMuteButtons'
import TweetList from '@/components/tweet/TweetList'

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [rawTweets, counts, followCheck, blockCheck, muteCheck] = await Promise.all([
    getTweetsByUserId(profile.id),
    getFollowCounts(profile.id),
    supabase.from('follows').select('follower_id').eq('follower_id', user!.id).eq('following_id', profile.id).single(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', user!.id).eq('blocked_id', profile.id).single(),
    supabase.from('mutes').select('muter_id').eq('muter_id', user!.id).eq('muted_id', profile.id).single(),
  ])

  const tweets = await attachLikedBy(rawTweets, user!.id)
  const isOwnProfile = user?.id === profile.id
  const isFollowing = !!followCheck.data
  const isBlocked = !!blockCheck.data
  const isMuted = !!muteCheck.data
  const canViewFollows = isOwnProfile || !profile.is_private || isFollowing

  return (
    <div>
      <ProfileHeader
        profile={profile}
        followers={counts.followers}
        following={counts.following}
        isOwnProfile={isOwnProfile}
        canViewFollows={canViewFollows}
        followButton={
          !isOwnProfile ? (
            <div className="flex items-center gap-2">
              <FollowButton
                targetUserId={profile.id}
                targetUsername={profile.username}
                initialIsFollowing={isFollowing}
              />
              <BlockMuteButtons
                targetId={profile.id}
                targetUsername={profile.username}
                initialBlocked={isBlocked}
                initialMuted={isMuted}
              />
            </div>
          ) : undefined
        }
      />
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage="No tweets yet."
      />
    </div>
  )
}
