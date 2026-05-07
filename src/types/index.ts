export type TweetWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}
