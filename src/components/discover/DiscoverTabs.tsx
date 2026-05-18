'use client'

import { useState } from 'react'
import UserSearch from './UserSearch'
import TweetSearch from './TweetSearch'

export default function DiscoverTabs({ currentUserId }: { currentUserId: string }) {
  const [tab, setTab] = useState<'people' | 'tweets'>('people')

  return (
    <div>
      <div role="tablist" aria-label="Discover" className="flex border-b">
        <button
          role="tab"
          aria-selected={tab === 'people'}
          aria-controls="discover-panel"
          onClick={() => setTab('people')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors hover:bg-muted/50 ${tab === 'people' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          People
        </button>
        <button
          role="tab"
          aria-selected={tab === 'tweets'}
          aria-controls="discover-panel"
          onClick={() => setTab('tweets')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors hover:bg-muted/50 ${tab === 'tweets' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Tweets
        </button>
      </div>
      <div id="discover-panel" role="tabpanel">
        {tab === 'people' ? (
          <UserSearch currentUserId={currentUserId} />
        ) : (
          <TweetSearch currentUserId={currentUserId} />
        )}
      </div>
    </div>
  )
}
