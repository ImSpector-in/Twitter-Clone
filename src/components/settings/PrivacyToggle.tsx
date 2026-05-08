'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Lock, Globe } from 'lucide-react'

export default function PrivacyToggle({ initialIsPrivate }: { initialIsPrivate: boolean }) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .update({ is_private: !isPrivate })
      .eq('id', user!.id)

    if (error) {
      toast.error('Failed to update privacy setting.')
    } else {
      setIsPrivate((prev) => !prev)
      toast.success(isPrivate ? 'Account set to public.' : 'Account set to private.')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        {isPrivate ? <Lock className="h-5 w-5 mt-0.5 shrink-0" /> : <Globe className="h-5 w-5 mt-0.5 shrink-0" />}
        <div>
          <p className="font-medium text-sm">Private account</p>
          <p className="text-muted-foreground text-sm">
            {isPrivate
              ? 'Only your followers can see your followers and following lists.'
              : 'Anyone can see your followers and following lists.'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${isPrivate ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
