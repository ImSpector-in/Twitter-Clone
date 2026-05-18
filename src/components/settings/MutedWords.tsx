'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { addMutedWord, removeMutedWord } from '@/lib/actions/mutes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type Word = { id: string; word: string }

export default function MutedWords({ initialWords }: { initialWords: Word[] }) {
  const [words, setWords] = useState(initialWords)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    try {
      await addMutedWord(input.trim())
      setWords((prev) => [...prev, { id: Date.now().toString(), word: input.trim().toLowerCase() }])
      setInput('')
      toast.success(`"${input.trim()}" muted.`)
    } catch {
      toast.error('Failed to add word.')
    }
    setLoading(false)
  }

  async function handleRemove(id: string, word: string) {
    try {
      await removeMutedWord(id)
      setWords((prev) => prev.filter((w) => w.id !== id))
      toast.success(`"${word}" unmuted.`)
    } catch {
      toast.error('Failed to remove word.')
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a word to mute..."
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading || !input.trim()}>Add</Button>
      </form>
      {words.length === 0 ? (
        <p className="text-sm text-muted-foreground">No muted words yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <span key={w.id} className="flex items-center gap-1 bg-muted text-sm px-2.5 py-1 rounded-full">
              {w.word}
              <button
                type="button"
                onClick={() => handleRemove(w.id, w.word)}
                aria-label={`Remove muted word: ${w.word}`}
                className="hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
