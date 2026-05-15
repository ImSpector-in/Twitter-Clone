export type TweetWithProfile = {
  id: string
  content: string
  created_at: string
  edited_at: string | null
  user_id: string
  reply_to_id: string | null
  retweet_of_id: string | null
  image_url: string | null
  gif_url: string | null
  reply_scope: string | null
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
    is_admin: boolean | null
  } | null
  link_status: string | null
  original?: {
    id: string
    content: string
    created_at: string
    edited_at: string | null
    user_id: string
    image_url: string | null
    gif_url: string | null
    reply_scope: string | null
    link_status: string | null
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
      is_admin: boolean | null
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
