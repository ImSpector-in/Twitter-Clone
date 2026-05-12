import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getTweetsByUserId, getFollowCounts } from '@/lib/queries/profile'
import { attachLikedBy, attachOriginals, getTweetById } from '@/lib/queries/tweets'
import ProfileHeader from '@/components/profile/ProfileHeader'
import FollowButton from '@/components/profile/FollowButton'
import BlockMuteButtons from '@/components/profile/BlockMuteButtons'
import TweetCard from '@/components/tweet/TweetCard'
import TweetList from '@/components/tweet/TweetList'
import { Lock, Pin } from 'lucide-react'

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [counts, followCheck, blockCheck, muteCheck] = await Promise.all([
    getFollowCounts(profile.id),
    supabase.from('follows').select('follower_id').eq('follower_id', user!.id).eq('following_id', profile.id).single(),
    supabase.from('blocks').select('blocker_id').eq('blocker_id', user!.id).eq('blocked_id', profile.id).single(),
    supabase.from('mutes').select('muter_id').eq('muter_id', user!.id).eq('muted_id', profile.id).single(),
  ])

  const isOwnProfile = user?.id === profile.id
  const isFollowing = !!followCheck.data
  const isBlocked = !!blockCheck.data
  const isMuted = !!muteCheck.data
  const canViewFollows = isOwnProfile || !profile.is_private || isFollowing

  // Q-005: Private accounts hide tweets from non-followers
  const canViewTweets = isOwnProfile || !profile.is_private || isFollowing

  let tweets: any[] = []
  let pinnedTweet: any = null
  if (canViewTweets) {
    const [rawTweets, pinned] = await Promise.all([
      getTweetsByUserId(profile.id),
      profile.pinned_tweet_id ? getTweetById(profile.pinned_tweet_id, user!.id) : Promise.resolve(null),
    ])
    const withOriginals = await attachOriginals(rawTweets)
    tweets = await attachLikedBy(withOriginals, user!.id)
    pinnedTweet = pinned
  }

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

      {canViewTweets ? (
        <>
          {pinnedTweet && (
            <div className="border-b border-border">
              <div className="flex items-center gap-1.5 px-4 pt-3 text-xs text-muted-foreground">
                <Pin className="h-3 w-3" />
                <span>Pinned</span>
              </div>
              <TweetCard
                tweet={pinnedTweet}
                currentUserId={user!.id}
                isPinned
                pinnedInProfile
                profileUsername={profile.username}
              />
            </div>
          )}
          <TweetList
            tweets={tweets as any}
            currentUserId={user!.id}
            emptyMessage="No tweets yet."
            profileUsername={isOwnProfile ? profile.username : undefined}
            pinnedTweetId={profile.pinned_tweet_id}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
          <Lock className="h-10 w-10 text-muted-foreground" />
          <h2 className="font-semibold text-lg">This account is private</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Follow this account to see their tweets.
          </p>
        </div>
      )}
    </div>
  )
}
