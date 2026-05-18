const GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-green-600',
  'from-blue-400 to-indigo-600',
  'from-fuchsia-400 to-pink-600',
]

export function getUserGradient(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}
