import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lock } from 'lucide-react'

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_private?: boolean | null
}

type Props = {
  profile: Profile
  followers: number
  following: number
  isOwnProfile: boolean
  followButton?: React.ReactNode
  canViewFollows: boolean
}

export default function ProfileHeader({ profile, followers, following, isOwnProfile, followButton, canViewFollows }: Props) {
  const displayName = profile.display_name || profile.username
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="border-b p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        {isOwnProfile ? (
          <a
            href="/profile/edit"
            className="text-sm border rounded-full px-4 py-1.5 font-semibold hover:bg-muted transition-colors"
          >
            Edit profile
          </a>
        ) : followButton}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{displayName}</h1>
          {profile.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </div>
      {profile.bio && <p className="text-sm">{profile.bio}</p>}
      <div className="flex gap-4 text-sm">
        {canViewFollows ? (
          <>
            <Link href={`/profile/${profile.username}/following`} className="hover:underline">
              <strong>{following}</strong> <span className="text-muted-foreground">Following</span>
            </Link>
            <Link href={`/profile/${profile.username}/followers`} className="hover:underline">
              <strong>{followers}</strong> <span className="text-muted-foreground">Followers</span>
            </Link>
          </>
        ) : (
          <>
            <span><strong>{following}</strong> <span className="text-muted-foreground">Following</span></span>
            <span><strong>{followers}</strong> <span className="text-muted-foreground">Followers</span></span>
          </>
        )}
      </div>
    </div>
  )
}
