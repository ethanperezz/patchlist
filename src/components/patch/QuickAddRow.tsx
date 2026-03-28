'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { MicSelect } from './MicSelect'
import type { Channel, InputType } from '@/lib/types'

interface QuickAddRowProps {
  showId: string
  groupId: string | null
  channelCount: number
  onChannelAdded: (channel: Channel) => void
  autoFocus?: boolean
}

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: 'xlr_mic', label: 'XLR' },
  { value: 'di', label: 'DI' },
  { value: 'wireless', label: 'WL' },
  { value: 'line', label: 'Line' },
  { value: 'comms', label: 'Comms' },
]

export function QuickAddRow({ showId, groupId, channelCount, onChannelAdded, autoFocus }: QuickAddRowProps) {
  const [name, setName] = useState('')
  const [port, setPort] = useState('')
  const [inputType, setInputType] = useState<InputType>('xlr_mic')
  const [mic, setMic] = useState('')
  const [active, setActive] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (autoFocus && nameRef.current) {
      nameRef.current.focus()
      setActive(true)
    }
  }, [autoFocus])

  function cycleInputType() {
    const idx = INPUT_TYPES.findIndex(t => t.value === inputType)
    const next = INPUT_TYPES[(idx + 1) % INPUT_TYPES.length]
    setInputType(next.value)
  }

  async function handleSubmit(overrideName?: string) {
    const channelName = overrideName ?? name.trim()
    // Allow blank rows — name defaults to empty string
    const id = crypto.randomUUID()
    const newChannel: Channel = {
      id,
      show_id: showId,
      channel_number: channelCount + 1,
      name: channelName || '',
      stage_port: port.trim() || null,
      input_type: inputType,
      mic_model: mic.trim() || null,
      phantom_48v: false,
      notes: null,
      sort_order: channelCount,
      group_id: groupId,
    }

    onChannelAdded(newChannel)

    // Reset for next entry
    setName('')
    setPort('')
    setMic('')
    nameRef.current?.focus()

    // Persist
    const { error } = await supabase.from('channels').insert({
      id,
      show_id: showId,
      channel_number: newChannel.channel_number,
      name: newChannel.name || '',
      stage_port: newChannel.stage_port,
      input_type: newChannel.input_type,
      mic_model: newChannel.mic_model,
      group_id: newChannel.group_id,
      sort_order: newChannel.sort_order,
    })
    if (error) console.error('Failed to insert channel:', error.message)
  }

  // Called when mic is selected from dropdown — auto-submit
  function handleSubmitAfterMic(selectedMic: string) {
    const id = crypto.randomUUID()
    const newChannel: Channel = {
      id,
      show_id: showId,
      channel_number: channelCount + 1,
      name: name.trim() || '',
      stage_port: port.trim() || null,
      input_type: inputType,
      mic_model: selectedMic || null,
      phantom_48v: false,
      notes: null,
      sort_order: channelCount,
      group_id: groupId,
    }
    onChannelAdded(newChannel)
    setName('')
    setPort('')
    setMic('')
    nameRef.current?.focus()
    supabase.from('channels').insert({
      id, show_id: showId, channel_number: newChannel.channel_number,
      name: newChannel.name || '', stage_port: newChannel.stage_port,
      input_type: newChannel.input_type, mic_model: newChannel.mic_model,
      group_id: newChannel.group_id, sort_order: newChannel.sort_order,
    }).then(({ error }) => { if (error) console.error('Failed to insert channel:', error.message) })
  }

  function handleKeyDown(e: React.KeyboardEvent, field: 'name' | 'port') {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'name' && !name.trim()) return
      if (field === 'name' && e.metaKey) {
        handleSubmit()
      } else if (field === 'name') {
        portRef.current?.focus()
      } else if (field === 'port') {
        // Submit if we have a name — mic is optional
        handleSubmit()
      }
    }
    if (e.key === 'Tab' && field === 'name' && !e.shiftKey) {
      e.preventDefault()
      portRef.current?.focus()
    }
    if (e.key === 'Escape') {
      setName('')
      setPort('')
      setMic('')
      setActive(false)
      ;(e.target as HTMLElement).blur()
    }
  }

  const typeLabel = INPUT_TYPES.find(t => t.value === inputType)?.label || 'XLR'

  return (
    <div
      className={cn(
        'grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_6rem_2rem_1fr] items-center gap-2 px-3 py-1 transition-colors',
        active ? 'bg-accent/40' : 'hover:bg-accent/20'
      )}
    >
      {/* Ch number preview */}
      <span className="text-[11px] font-mono tabular-nums text-muted-foreground/30 text-right pr-1">
        {channelCount + 1}
      </span>

      {/* Name */}
      <Input
        ref={nameRef}
        value={name}
        onChange={e => setName(e.target.value)}
        onFocus={() => setActive(true)}
        onKeyDown={e => handleKeyDown(e, 'name')}
        placeholder="Channel name..."
        className="h-6 text-xs border-transparent bg-transparent px-1 placeholder:text-muted-foreground/30 focus:bg-background focus:border-input"
      />

      {/* Port */}
      <Input
        ref={portRef}
        value={port}
        onChange={e => setPort(e.target.value)}
        onKeyDown={e => handleKeyDown(e, 'port')}
        placeholder="Port"
        className="h-6 text-xs font-mono border-transparent bg-transparent px-1 placeholder:text-muted-foreground/30 focus:bg-background focus:border-input"
      />

      {/* Input type — click to cycle */}
      <button
        onClick={cycleInputType}
        className="h-6 rounded px-1 text-[10px] font-semibold tracking-wide text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
        title="Click to cycle input type"
        tabIndex={-1}
      >
        {typeLabel}
      </button>

      {/* Mic model */}
      <MicSelect
        value={mic || null}
        onChange={(v) => { setMic(v); handleSubmitAfterMic(v) }}
        compact
        placeholder="Mic"
      />

      {/* 48V placeholder */}
      <div />

      {/* Hint text */}
      <div className="flex items-center">
        {active && name.trim() && (
          <span className="text-[10px] text-muted-foreground/40">
            Enter to submit
          </span>
        )}
      </div>
    </div>
  )
}
