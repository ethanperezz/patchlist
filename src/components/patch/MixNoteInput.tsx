'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function MixNoteInput({ mixId }: { mixId: string }) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('mix_notes').insert({
      mix_id: mixId,
      user_id: user.id,
      body: body.trim(),
    })

    setBody('')
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add a note..."
        className="h-7 text-xs"
      />
      <Button type="submit" size="sm" variant="secondary" className="h-7 text-xs shrink-0" disabled={saving || !body.trim()}>
        Add
      </Button>
    </form>
  )
}
