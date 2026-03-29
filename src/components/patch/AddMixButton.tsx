'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Mix, MixType } from '@/lib/types'

interface AddMixButtonProps {
  showId: string
  mixCount: number
  onMixAdded: (mix: Mix) => void
}

export function AddMixButton({ showId, mixCount, onMixAdded }: AddMixButtonProps) {
  const [open, setOpen] = useState(false)
  const [mixNumber, setMixNumber] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<string>('wedge')
  const [system, setSystem] = useState('')
  const [position, setPosition] = useState('')
  const supabase = createClient()

  async function handleAdd() {
    if (!name.trim()) return

    const id = crypto.randomUUID()
    const newMix: Mix = {
      id,
      show_id: showId,
      mix_number: mixNumber.trim() || `Mix ${mixCount + 1}`,
      name: name.trim(),
      type: (type as MixType) || null,
      system: system.trim() || null,
      position: position.trim() || null,
      sort_order: mixCount,
      feeds: [],
    }

    onMixAdded(newMix)

    setMixNumber('')
    setName('')
    setSystem('')
    setPosition('')
    setOpen(false)

    const { error } = await supabase.from('mixes').insert({
      id,
      show_id: showId,
      mix_number: newMix.mix_number,
      name: newMix.name,
      type: newMix.type,
      system: newMix.system,
      position: newMix.position,
      sort_order: newMix.sort_order,
      feeds: newMix.feeds,
    })
    if (error) console.error('Failed to add mix:', error.message)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-[11px] font-normal">+ Mix</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Mix</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Mix # (e.g. Mix 1, Mix 3-4)</Label>
              <Input
                value={mixNumber}
                onChange={e => setMixNumber(e.target.value)}
                placeholder={`Mix ${mixCount + 1}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Drums IEM"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wedge">Wedge</SelectItem>
                <SelectItem value="iem">IEM</SelectItem>
                <SelectItem value="fx">FX</SelectItem>
                <SelectItem value="matrix">Matrix</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">System</Label>
              <Input
                value={system}
                onChange={e => setSystem(e.target.value)}
                placeholder="Sennheiser 300 G4"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Position</Label>
              <Input
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="SR downstage"
                className="text-xs"
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full" size="sm" disabled={!name.trim()}>
            Add mix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
