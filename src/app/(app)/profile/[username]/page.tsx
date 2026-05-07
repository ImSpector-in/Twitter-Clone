import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getTweetsByUserId, getFollowCounts } from '@/lib/queries/profile'
import ProfileHeader from '@/components/profile/ProfileHeader'
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

  const [tweets, counts] = await Promise.all([
    getTweetsByUserId(profile.id),
    getFollowCounts(profile.id),
  ])

  const isOwnProfile = user?.id === profile.id

  return (
    <div>
      <ProfileHeader
        profile={profile}
        followers={counts.followers}
        following={counts.following}
        isOwnProfile={isOwnProfile}
      />
      <TweetList
        tweets={tweets as any}
        currentUserId={user!.id}
        emptyMessage="No tweets yet."
      />
    </div>
  )
}
