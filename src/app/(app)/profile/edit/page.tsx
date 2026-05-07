'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateProfile(formData)
      toast.success('Profile updated!')
      router.push(`/profile/${result.username}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="border-b pb-3">
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Username</label>
          <Input
            name="username"
            placeholder="yourhandle"
            pattern="[a-z0-9_]{3,20}"
            title="3-20 characters: lowercase letters, numbers, underscores"
            required
          />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscores. 3-20 chars.</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Display Name</label>
          <Input name="display_name" placeholder="Your Name" maxLength={50} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Bio</label>
          <Textarea name="bio" placeholder="Tell the world about yourself" maxLength={160} rows={3} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
