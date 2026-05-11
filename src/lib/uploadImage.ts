// Q-008 + Q-025: All image uploads go through /api/upload for server-side
// magic byte validation and random UUID path assignment.
export async function uploadImage(file: File, bucket: 'tweet-images' | 'avatars'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const json = await res.json()

  if (!res.ok) throw new Error(json.error ?? 'Upload failed')
  return json.url as string
}
