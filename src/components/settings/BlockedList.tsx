'use client'

import { unblockUser } from '@/lib/actions/blocks'
import UserActionList from './UserActionList'

type User = { id: string; username: string; display_name: string | null; avatar_url: string | null }

export default function BlockedList({ initialList }: { initialList: User[] }) {
  return (
    <UserActionList
      initialList={initialList}
      onAction={unblockUser}
      actionLabel="Unblock"
      emptyText="You haven't blocked anyone."
      successMessage="Unblocked."
      errorMessage="Failed to unblock."
    />
  )
}
