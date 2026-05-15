import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditProfileForm from '@/components/profile/EditProfileForm'
import AvatarUpload from '@/components/profile/AvatarUpload'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const displayName = profile.display_name || profile.username

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="border-b pb-3 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>
      <AvatarUpload
        userId={user.id}
        currentAvatarUrl={profile.avatar_url}
        displayName={displayName}
      />
      <EditProfileForm
        initialUsername={profile.username}
        initialDisplayName={profile.display_name ?? ''}
        initialBio={profile.bio ?? ''}
      />
    </div>
  )
}
