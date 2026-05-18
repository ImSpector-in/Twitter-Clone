export const TWEET_MAX_LENGTH = 280
export const TWEET_RATE_LIMIT_PER_HOUR = 30
export const FEED_PAGE_SIZE = 20
export const SEARCH_RESULT_LIMIT = 10
export const PROFILE_TWEET_LIMIT = 50
export const GIPHY_RESULT_LIMIT = 20
export const MIN_PASSWORD_LENGTH = 12
// Gate: new accounts must wait this long before posting links (1 hour)
export const ACCOUNT_AGE_MIN_MS = 60 * 60 * 1000
// Window used for per-user tweet rate limits (separate concept from account age)
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
export const MESSAGE_MAX_LENGTH = 1000
export const MESSAGE_RATE_LIMIT_PER_HOUR = 200
export const PG_UNIQUE_VIOLATION = '23505'
export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`

export const REPLY_SCOPES = ['everyone', 'followers', 'nobody'] as const
export type ReplyScope = typeof REPLY_SCOPES[number]
