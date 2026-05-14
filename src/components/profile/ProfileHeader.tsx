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
  is_admin?: boolean | null
}

type Props = {
  profile: Profile
  followers: number
  following: number
  isOwnProfile: boolean
  followButton?: React.ReactNode
  messageButton?: React.ReactNode
  canViewFollows: boolean
}

export default function ProfileHeader({ profile, followers, following, isOwnProfile, followButton, messageButton, canViewFollows }: Props) {
  const displayName = profile.display_name || profile.username
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="border-b">
      {/* Gradient banner */}
      <div className="h-28 bg-gradient-to-r from-primary/70 via-cyan-400/50 to-teal-500/30" />

      <div className="px-4 pb-4 space-y-3 -mt-10">
        <div className="flex items-end justify-between">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-cyan-400 text-white">{initials}</AvatarFallback>
          </Avatar>
          {isOwnProfile ? (
            <a
              href="/profile/edit"
              className="text-sm border border-primary/30 rounded-full px-4 py-1.5 font-semibold hover:bg-primary/10 hover:border-primary transition-colors text-primary"
            >
              Edit profile
            </a>
          ) : (
            <div className="flex items-center gap-2">
              {messageButton}
              {followButton}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{displayName}</h1>
            {profile.is_admin && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground uppercase tracking-wide leading-none">
                admin
              </span>
            )}
            {profile.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground text-sm">@{profile.username}</p>
        </div>

        {profile.bio && <p className="text-sm">{profile.bio}</p>}

        <div className="flex gap-4 text-sm">
          {canViewFollows ? (
            <>
              <Link href={`/profile/${profile.username}/following`} className="hover:underline hover:text-primary transition-colors">
                <strong>{following}</strong> <span className="text-muted-foreground">Following</span>
              </Link>
              <Link href={`/profile/${profile.username}/followers`} className="hover:underline hover:text-primary transition-colors">
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
    </div>
  )
}
