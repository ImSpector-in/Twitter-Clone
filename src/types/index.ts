export type TweetWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  reply_to_id: string | null
  image_url: string | null
  like_count: number
  liked_by_me: boolean
  reply_count: number
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export type Notification = {
  id: string
  type: 'like' | 'follow' | 'reply'
  read: boolean
  created_at: string
  tweet_id: string | null
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}
