'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TechPage() {
  const { id } = useParams<{ id: string }>()
  const { show, channels, wirelessEntries, isEditor, loading } = useShow(id)
  const [stageNotes, setStageNotes] = useState(show?.show_notes || '')
  const supabase = createClient()

  const mics = channels.filter(ch => ch.input_type === 'xlr_mic')
  const dis = channels.filter(ch => ch.input_type === 'di')
  const wirelessChannels = channels.filter(ch => ch.input_type === 'wireless')

  async function saveStageNotes() {
    if (!show) return
    await supabase.from('shows').update({ show_notes: stageNotes }).eq('id', show.id)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between no-print">
        <h2 className="text-sm font-semibold">Stage Tech View</h2>
        <PDFExportButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mics needed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mics Needed ({mics.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mics.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-1">
                {mics.map(ch => (
                  <li key={ch.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{ch.name}</span>
                    <span className="text-muted-foreground">{ch.mic_model || '--'}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* DIs needed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              DIs Needed ({dis.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dis.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-1">
                {dis.map(ch => (
                  <li key={ch.id} className="text-xs font-medium">{ch.name}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Wireless */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wireless ({wirelessChannels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wirelessChannels.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-1">
                {wirelessChannels.map(ch => {
                  const w = wirelessEntries.find(we => we.channel_id === ch.id)
                  return (
                    <li key={ch.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{ch.name}</span>
                      {w?.pack_id && <span className="font-mono text-muted-foreground">{w.pack_id}</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stage box runs */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stage Box Runs / Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={stageNotes}
            onChange={e => setStageNotes(e.target.value)}
            onBlur={saveStageNotes}
            placeholder="Stage box positions, cable runs, power drops..."
            className="min-h-[100px] text-xs"
            readOnly={!isEditor}
          />
        </CardContent>
      </Card>
    </div>
  )
}
