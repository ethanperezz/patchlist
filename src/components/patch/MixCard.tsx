'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MixTypeBadge } from './ChangeBadge'
import { MixNoteInput } from './MixNoteInput'
import type { Mix, MixNote } from '@/lib/types'

interface MixCardProps {
  mix: Mix
  notes: MixNote[]
  isEditor: boolean
  onUpdate: (updated: Mix) => void
}

export function MixCard({ mix, notes, isEditor, onUpdate }: MixCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const supabase = createClient()

  async function saveEdit(field: string) {
    setEditingField(null)
    const current = (mix as any)[field]
    if (String(current || '') === editValue.trim()) return

    const updated = { ...mix, [field]: editValue.trim() || null }
    onUpdate(updated)
    await supabase.from('mixes').update({ [field]: editValue.trim() || null }).eq('id', mix.id)
  }

  function EditableText({ field, value, className }: { field: string; value: string; className?: string }) {
    if (editingField === field) {
      return (
        <Input
          className="h-6 text-xs px-1"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => saveEdit(field)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(field); if (e.key === 'Escape') setEditingField(null) }}
          autoFocus
        />
      )
    }
    return (
      <span
        className={cn('text-xs', isEditor && 'editable-cell', className)}
        onClick={() => { if (!isEditor) return; setEditingField(field); setEditValue(value || '') }}
      >
        {value || <span className="text-muted-foreground/30">&mdash;</span>}
      </span>
    )
  }

  return (
    <Card className="border-border/50 transition-shadow hover:shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="mix-card-header">
          <Badge variant="outline" className="text-[10px] font-mono tabular-nums h-5 px-1.5">
            {mix.mix_number}
          </Badge>
          <MixTypeBadge type={mix.type} />
          <EditableText field="name" value={mix.name} className="font-medium text-sm text-foreground" />
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          {mix.system && (
            <div className="text-[10px] text-muted-foreground">
              <span className="text-muted-foreground/50">System </span>
              <EditableText field="system" value={mix.system} />
            </div>
          )}
          {mix.position && (
            <div className="text-[10px] text-muted-foreground">
              <span className="text-muted-foreground/50">Pos </span>
              <EditableText field="position" value={mix.position} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {/* Feed chips */}
        {mix.feeds && mix.feeds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {mix.feeds.map((feed, i) => (
              <span key={i} className="feed-chip">
                {feed}
              </span>
            ))}
          </div>
        )}

        {/* Notes toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {showNotes ? 'Hide notes' : `Notes (${notes.length})`}
        </button>

        {showNotes && (
          <div className="mt-2 space-y-2">
            {notes.map(note => (
              <div key={note.id} className="rounded-md border bg-muted/30 p-2.5">
                <p className="text-xs leading-relaxed">{note.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  {(note.user as any)?.name || 'Unknown'} &middot;{' '}
                  {new Date(note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ))}
            <MixNoteInput mixId={mix.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
