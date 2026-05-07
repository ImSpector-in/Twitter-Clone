export type TweetWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  like_count: number
  liked_by_me: boolean
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}
