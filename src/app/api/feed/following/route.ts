import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFeedTweets } from '@/lib/queries/tweets'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') || null

  const result = await getFeedTweets(user.id, cursor)
  return NextResponse.json(result)
}
