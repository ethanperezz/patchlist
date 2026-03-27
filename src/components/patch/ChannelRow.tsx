'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { InputTypeBadge, PhantomBadge, ChangedBadge } from './ChangeBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Channel, ChangelogEntry, InputType } from '@/lib/types'

interface ChannelRowProps {
  channel: Channel
  changes: ChangelogEntry[]
  isEditor: boolean
  onUpdate: (updated: Channel) => void
}

export function ChannelRow({ channel, changes, isEditor, onUpdate }: ChannelRowProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const supabase = createClient()
  const hasChanges = changes.length > 0

  const startEdit = useCallback((field: string, value: string) => {
    if (!isEditor) return
    setEditing(field)
    setEditValue(value || '')
  }, [isEditor])

  async function saveEdit(field: string) {
    setEditing(null)
    const trimmed = editValue.trim()
    const currentVal = (channel as any)[field]

    let newVal: any = trimmed
    if (field === 'phantom_48v') newVal = trimmed === 'true'
    else if (field === 'channel_number' || field === 'sort_order') newVal = parseInt(trimmed) || 0

    if (String(currentVal || '') === String(newVal || '')) return

    const updated = { ...channel, [field]: newVal || null }
    onUpdate(updated)

    const { error } = await supabase
      .from('channels')
      .update({ [field]: newVal || null })
      .eq('id', channel.id)

    if (error) onUpdate(channel)
  }

  function handleKeyDown(e: React.KeyboardEvent, field: string) {
    if (e.key === 'Enter') saveEdit(field)
    if (e.key === 'Escape') setEditing(null)
  }

  function EditableCell({ field, value, className, mono }: { field: string; value: string; className?: string; mono?: boolean }) {
    if (editing === field) {
      return (
        <Input
          className="h-6 text-xs px-1"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => saveEdit(field)}
          onKeyDown={e => handleKeyDown(e, field)}
          autoFocus
        />
      )
    }
    return (
      <span
        className={cn(
          'truncate text-xs',
          isEditor && 'editable-cell',
          mono && 'font-mono tabular-nums',
          className
        )}
        onClick={() => startEdit(field, value)}
      >
        {value || <span className="text-muted-foreground/30">&mdash;</span>}
      </span>
    )
  }

  const latestChange = changes[0]

  return (
    <div
      className={cn(
        'channel-row grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_6rem_2rem_1fr] items-center gap-2 px-3 py-2 channel-row-interactive',
        hasChanges && 'changed border-l-2 border-l-[var(--changed)]',
        hasChanges && 'bg-[var(--changed-bg)]'
      )}
    >
      {/* Ch number */}
      <span className="text-[11px] font-mono tabular-nums text-muted-foreground/60 text-right pr-1">
        {channel.channel_number}
      </span>

      {/* Name */}
      <div className="min-w-0 flex items-center gap-1.5">
        <EditableCell field="name" value={channel.name} className="font-medium text-foreground" />
        {hasChanges && <ChangedBadge />}
      </div>

      {/* Stage port */}
      <EditableCell field="stage_port" value={channel.stage_port || ''} mono className="text-muted-foreground" />

      {/* Input type badge */}
      <div
        onClick={() => isEditor && startEdit('input_type', channel.input_type || '')}
        className={cn(isEditor && 'cursor-pointer')}
      >
        {editing === 'input_type' ? (
          <Select
            value={editValue}
            onValueChange={(v) => {
              setEditValue(v)
              setEditing(null)
              const updated = { ...channel, input_type: (v as InputType) || null }
              onUpdate(updated)
              supabase.from('channels').update({ input_type: v }).eq('id', channel.id)
            }}
          >
            <SelectTrigger className="h-6 w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="xlr_mic">XLR</SelectItem>
              <SelectItem value="di">DI</SelectItem>
              <SelectItem value="wireless">WL</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="comms">Comms</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <InputTypeBadge type={channel.input_type} />
        )}
      </div>

      {/* Mic model */}
      <EditableCell field="mic_model" value={channel.mic_model || ''} className="text-muted-foreground" />

      {/* Phantom */}
      <div
        className={cn(
          'flex justify-center items-center h-6',
          isEditor && 'cursor-pointer rounded transition-colors hover:bg-accent/80'
        )}
        onClick={() => {
          if (!isEditor) return
          const updated = { ...channel, phantom_48v: !channel.phantom_48v }
          onUpdate(updated)
          supabase.from('channels').update({ phantom_48v: !channel.phantom_48v }).eq('id', channel.id)
        }}
        title={isEditor ? (channel.phantom_48v ? 'Disable 48V' : 'Enable 48V') : undefined}
      >
        {channel.phantom_48v ? (
          <PhantomBadge />
        ) : (
          isEditor && <span className="text-[9px] text-muted-foreground/20">48V</span>
        )}
      </div>

      {/* Notes + change note */}
      <div className="min-w-0">
        <EditableCell field="notes" value={channel.notes || ''} className="text-muted-foreground/70" />
        {latestChange && (
          <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--changed)' }}>
            <span className="font-medium">{latestChange.field_changed}:</span>{' '}
            <span className="line-through opacity-60">{latestChange.previous_value || '(empty)'}</span>{' '}
            &rarr; {latestChange.new_value || '(empty)'}
          </p>
        )}
      </div>
    </div>
  )
}
