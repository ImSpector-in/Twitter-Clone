import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type Props = {
  profile: Profile
  followers: number
  following: number
  isOwnProfile: boolean
}

export default function ProfileHeader({ profile, followers, following, isOwnProfile }: Props) {
  const displayName = profile.display_name || profile.username
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="border-b p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <a
            href="/profile/edit"
            className="text-sm border rounded-full px-4 py-1.5 font-semibold hover:bg-muted transition-colors"
          >
            Edit profile
          </a>
        )}
      </div>
      <div>
        <h1 className="text-xl font-bold">{displayName}</h1>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </div>
      {profile.bio && (
        <p className="text-sm">{profile.bio}</p>
      )}
      <div className="flex gap-4 text-sm">
        <span><strong>{following}</strong> <span className="text-muted-foreground">Following</span></span>
        <span><strong>{followers}</strong> <span className="text-muted-foreground">Followers</span></span>
      </div>
    </div>
  )
}
