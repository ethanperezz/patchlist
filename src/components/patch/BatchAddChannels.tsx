'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MicSelect } from './MicSelect'
import type { Channel, ChannelGroup, InputType } from '@/lib/types'

interface BatchAddProps {
  showId: string
  groups: ChannelGroup[]
  channelCount: number
  onChannelsAdded: (channels: Channel[]) => void
}

export function BatchAddChannels({ showId, groups, channelCount, onChannelsAdded }: BatchAddProps) {
  const [open, setOpen] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [count, setCount] = useState(4)
  const [startNum, setStartNum] = useState(1)
  const [inputType, setInputType] = useState<string>('xlr_mic')
  const [mic, setMic] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('none')
  const [phantom, setPhantom] = useState(false)
  const supabase = createClient()

  function preview(): string[] {
    const items: string[] = []
    for (let i = 0; i < count; i++) {
      items.push(`${prefix} ${startNum + i}`.trim())
    }
    return items
  }

  async function handleAdd() {
    if (!prefix.trim() || count < 1) return

    const names = preview()
    const newChannels: Channel[] = names.map((name, i) => ({
      id: crypto.randomUUID(),
      show_id: showId,
      channel_number: channelCount + i + 1,
      name,
      stage_port: null,
      input_type: (inputType as InputType) || null,
      mic_model: mic || null,
      phantom_48v: phantom,
      notes: null,
      sort_order: channelCount + i,
      group_id: groupId === 'none' ? null : groupId,
    }))

    onChannelsAdded(newChannels)
    setOpen(false)
    setPrefix('')
    setCount(4)
    setStartNum(1)

    const { error } = await supabase.from('channels').insert(
      newChannels.map(ch => ({
        id: ch.id,
        show_id: ch.show_id,
        channel_number: ch.channel_number,
        name: ch.name,
        input_type: ch.input_type,
        mic_model: ch.mic_model,
        phantom_48v: ch.phantom_48v,
        group_id: ch.group_id,
        sort_order: ch.sort_order,
      }))
    )
    if (error) console.error('Batch insert failed:', error.message)
  }

  const previewItems = preview()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-[11px] font-normal">
          Batch add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Batch Add Channels</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Add multiple channels with the same settings. e.g. &quot;Track&quot; 1-6 or &quot;Vox&quot; 1-5
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 space-y-1">
              <Label className="text-xs">Prefix</Label>
              <Input
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                placeholder="Track"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start #</Label>
              <Input
                type="number"
                min={1}
                value={startNum}
                onChange={e => setStartNum(parseInt(e.target.value) || 1)}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Count</Label>
              <Input
                type="number"
                min={1}
                max={32}
                value={count}
                onChange={e => setCount(Math.min(32, parseInt(e.target.value) || 1))}
                className="tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Input type</Label>
              <Select value={inputType} onValueChange={setInputType}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlr_mic">XLR Mic</SelectItem>
                  <SelectItem value="di">DI</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="comms">Comms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mic (all same)</Label>
              <MicSelect value={mic || null} onChange={setMic} placeholder="Optional" />
            </div>
          </div>

          {groups.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Group</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={phantom}
              onChange={e => setPhantom(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border accent-foreground"
            />
            <span className="text-xs text-muted-foreground">48V Phantom on all</span>
          </label>

          {/* Preview */}
          {prefix.trim() && (
            <div className="rounded-md border bg-muted/30 p-2">
              <p className="text-[10px] text-muted-foreground mb-1">Preview ({previewItems.length} channels):</p>
              <div className="flex flex-wrap gap-1">
                {previewItems.map((name, i) => (
                  <span key={i} className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] tabular-nums">
                    Ch {channelCount + i + 1}: {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleAdd} className="w-full" size="sm" disabled={!prefix.trim()}>
            Add {count} channels
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
