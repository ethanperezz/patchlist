'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MicSelect } from './MicSelect'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Channel, ChannelGroup, InputType } from '@/lib/types'

interface AddChannelButtonProps {
  showId: string
  groups: ChannelGroup[]
  channelCount: number
  onChannelAdded: (channel: Channel) => void
}

export const AddChannelButton = forwardRef<{ open: () => void }, AddChannelButtonProps>(
  function AddChannelButton({ showId, groups, channelCount, onChannelAdded }, ref) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [inputType, setInputType] = useState('xlr_mic')
    const [groupId, setGroupId] = useState<string>('none')
    const [micModel, setMicModel] = useState('')
    const [addAnother, setAddAnother] = useState(false)
    const [lastAdded, setLastAdded] = useState<string | null>(null)
    const supabase = createClient()

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }))

    async function handleAdd() {
      if (!name.trim()) return

      const id = crypto.randomUUID()
      const newChannel: Channel = {
        id,
        show_id: showId,
        channel_number: channelCount + 1,
        name: name.trim(),
        stage_port: null,
        input_type: inputType as InputType,
        mic_model: micModel.trim() || null,
        phantom_48v: false,
        notes: null,
        sort_order: channelCount,
        group_id: groupId === 'none' ? null : groupId,
      }

      onChannelAdded(newChannel)
      setLastAdded(newChannel.name)

      // Persist
      supabase.from('channels').insert({
        id,
        show_id: showId,
        channel_number: newChannel.channel_number,
        name: newChannel.name || '',
        input_type: newChannel.input_type,
        mic_model: newChannel.mic_model,
        group_id: newChannel.group_id,
        sort_order: newChannel.sort_order,
      }).then(({ error }) => { if (error) console.error('Failed to insert channel:', error.message) })

      if (addAnother) {
        // Keep dialog open, clear name and mic, keep group and type
        setName('')
        setMicModel('')
      } else {
        setName('')
        setMicModel('')
        setInputType('xlr_mic')
        setGroupId('none')
        setOpen(false)
        setLastAdded(null)
      }
    }

    function handleOpenChange(isOpen: boolean) {
      setOpen(isOpen)
      if (!isOpen) {
        setLastAdded(null)
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 text-[11px] font-normal">
            + Channel
            <kbd className="ml-1.5 hidden sm:inline-flex rounded border border-border/50 px-1 py-0.5 text-[9px] font-mono text-muted-foreground/50">
              Cmd+N
            </kbd>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {lastAdded && (
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Added <span className="font-medium text-foreground">{lastAdded}</span> as Ch {channelCount}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Kick In"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label className="text-xs">Mic model</Label>
                <MicSelect value={micModel || null} onChange={setMicModel} placeholder="Search mics..." />
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
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addAnother}
                  onChange={e => setAddAnother(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border accent-foreground"
                />
                <span className="text-xs text-muted-foreground">Add another</span>
              </label>
              <Button onClick={handleAdd} size="sm" disabled={!name.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
