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

    // Handle type coercion for boolean/number fields
    let newVal: any = trimmed
    if (field === 'phantom_48v') newVal = trimmed === 'true'
    else if (field === 'channel_number' || field === 'sort_order') newVal = parseInt(trimmed) || 0

    if (String(currentVal || '') === String(newVal || '')) return

    // Optimistic update
    const updated = { ...channel, [field]: newVal || null }
    onUpdate(updated)

    const { error } = await supabase
      .from('channels')
      .update({ [field]: newVal || null })
      .eq('id', channel.id)

    if (error) {
      // Rollback
      onUpdate(channel)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, field: string) {
    if (e.key === 'Enter') saveEdit(field)
    if (e.key === 'Escape') setEditing(null)
  }

  function EditableCell({ field, value, className, mono }: { field: string; value: string; className?: string; mono?: boolean }) {
    if (editing === field) {
      if (field === 'input_type') {
        return (
          <Select value={editValue} onValueChange={(v) => { setEditValue(v); setEditing(null); const trimmed = v; const updated = { ...channel, [field]: trimmed || null }; onUpdate(updated); supabase.from('channels').update({ [field]: trimmed || null }).eq('id', channel.id) }}>
            <SelectTrigger className="h-6 w-24 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="xlr_mic">XLR Mic</SelectItem>
              <SelectItem value="di">DI</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="comms">Comms</SelectItem>
            </SelectContent>
          </Select>
        )
      }
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
          'cursor-default truncate text-xs',
          isEditor && 'cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1',
          mono && 'font-mono',
          className
        )}
        onClick={() => startEdit(field, value)}
      >
        {value || <span className="text-muted-foreground/50">&mdash;</span>}
      </span>
    )
  }

  const latestChange = changes[0]

  return (
    <div
      className={cn(
        'channel-row grid grid-cols-[3rem_1fr_5rem_4rem_6rem_2rem_1fr] items-center gap-2 border-b px-2 py-1.5',
        hasChanges && 'changed border-l-2 border-l-[var(--changed)] bg-[var(--changed-bg)]'
      )}
    >
      {/* Ch number */}
      <span className="text-xs font-mono text-muted-foreground text-right pr-2">
        {channel.channel_number}
      </span>

      {/* Name */}
      <div className="min-w-0 flex items-center gap-1.5">
        <EditableCell field="name" value={channel.name} className="font-medium" />
        {hasChanges && <ChangedBadge />}
      </div>

      {/* Stage port */}
      <EditableCell field="stage_port" value={channel.stage_port || ''} mono />

      {/* Input type badge */}
      <div onClick={() => isEditor && startEdit('input_type', channel.input_type || '')} className={cn(isEditor && 'cursor-pointer')}>
        {editing === 'input_type' ? (
          <Select value={editValue} onValueChange={(v) => { setEditValue(v); setEditing(null); const updated = { ...channel, input_type: v as InputType }; onUpdate(updated); supabase.from('channels').update({ input_type: v }).eq('id', channel.id) }}>
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
      <EditableCell field="mic_model" value={channel.mic_model || ''} />

      {/* Phantom */}
      <div
        className={cn('flex justify-center', isEditor && 'cursor-pointer')}
        onClick={() => {
          if (!isEditor) return
          const updated = { ...channel, phantom_48v: !channel.phantom_48v }
          onUpdate(updated)
          supabase.from('channels').update({ phantom_48v: !channel.phantom_48v }).eq('id', channel.id)
        }}
      >
        {channel.phantom_48v && <PhantomBadge />}
      </div>

      {/* Notes + change note */}
      <div className="min-w-0">
        <EditableCell field="notes" value={channel.notes || ''} className="text-muted-foreground" />
        {latestChange && (
          <p className="text-[10px] text-[var(--changed)] mt-0.5">
            {latestChange.field_changed}: {latestChange.previous_value || '(empty)'} &rarr; {latestChange.new_value || '(empty)'}
          </p>
        )}
      </div>
    </div>
  )
}
