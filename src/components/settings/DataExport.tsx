'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function DataExport() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [tweetsRes, likesRes, followsRes, profileRes] = await Promise.all([
      supabase.from('tweets').select('id, content, image_url, created_at').eq('user_id', user.id),
      supabase.from('likes').select('tweet_id, created_at').eq('user_id', user.id),
      supabase.from('follows').select('following_id, created_at').eq('follower_id', user.id),
      supabase.from('profiles').select('username, display_name, bio, created_at').eq('id', user.id).single(),
    ])

    const data = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      tweets: tweetsRes.data ?? [],
      likes: likesRes.data ?? [],
      following: followsRes.data ?? [],
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `twitter-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Download your data</p>
        <p className="text-muted-foreground text-sm">Export your tweets, likes, and follows as JSON.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
        <Download className="h-4 w-4 mr-1" />
        {loading ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  )
}
