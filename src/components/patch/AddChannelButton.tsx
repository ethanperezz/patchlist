'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChannelGroup } from '@/lib/types'

export function AddChannelButton({ showId, groups, channelCount }: { showId: string; groups: ChannelGroup[]; channelCount: number }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [inputType, setInputType] = useState('xlr_mic')
  const [groupId, setGroupId] = useState<string>('none')
  const [micModel, setMicModel] = useState('')
  const supabase = createClient()

  async function handleAdd() {
    if (!name.trim()) return

    await supabase.from('channels').insert({
      show_id: showId,
      channel_number: channelCount + 1,
      name: name.trim(),
      input_type: inputType,
      mic_model: micModel.trim() || null,
      group_id: groupId === 'none' ? null : groupId,
      sort_order: channelCount,
    })

    setName('')
    setMicModel('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">+ Channel</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Kick In" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
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
              <Input value={micModel} onChange={e => setMicModel(e.target.value)} placeholder="SM57" className="text-xs" />
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
          <Button onClick={handleAdd} className="w-full" size="sm">Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
