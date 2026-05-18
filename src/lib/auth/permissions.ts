type MinimalProfile = {
  id: string
  is_private: boolean | null
}

export function canViewProfile(
  profile: MinimalProfile,
  viewerId: string,
  isFollowing: boolean
): boolean {
  if (viewerId === profile.id) return true
  if (!profile.is_private) return true
  return isFollowing
}
