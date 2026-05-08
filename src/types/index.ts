export type TweetWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  reply_to_id: string | null
  retweet_of_id: string | null
  image_url: string | null
  like_count: number
  liked_by_me: boolean
  reply_count: number
  retweet_count: number
  retweeted_by_me: boolean
  bookmarked_by_me: boolean
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  original?: {
    id: string
    content: string
    created_at: string
    user_id: string
    image_url: string | null
    profiles: {
      username: string
      display_name: string | null
      avatar_url: string | null
    } | null
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
