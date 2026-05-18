'use client'

import { unmuteUser } from '@/lib/actions/mutes'
import UserActionList from './UserActionList'

type User = { id: string; username: string; display_name: string | null; avatar_url: string | null }

export default function MutedList({ initialList }: { initialList: User[] }) {
  return (
    <UserActionList
      initialList={initialList}
      onAction={unmuteUser}
      actionLabel="Unmute"
      emptyText="You haven't muted anyone."
      successMessage="Unmuted."
      errorMessage="Failed to unmute."
    />
  )
}
