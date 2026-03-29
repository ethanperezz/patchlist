'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { Skeleton } from '@/components/ui/skeleton'

export default function BandPage() {
  const { id } = useParams<{ id: string }>()
  const { show, channels, groups, mixes, mixNotes, wirelessEntries, changelog, loading } = useShow(id)

  if (loading) {
    return <Skeleton className="h-[300px]" />
  }

  // Group channels same as FOH
  const groupedChannels = new Map<string | null, typeof channels>()
  for (const ch of channels) {
    const key = ch.group_id
    if (!groupedChannels.has(key)) groupedChannels.set(key, [])
    groupedChannels.get(key)!.push(ch)
  }

  const orderedGroups = [...groups]
  const ungrouped = groupedChannels.get(null) || []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between no-print">
        <h2 className="text-sm font-semibold">Band View</h2>
        <PDFExportButton show={show} channels={channels} groups={groups} mixes={mixes} mixNotes={mixNotes} wirelessEntries={wirelessEntries} changelog={changelog} />
      </div>

      <p className="mb-4 text-xs text-muted-foreground no-print">
        Simplified view: channel name and stage port only. No console data.
      </p>

      {orderedGroups.map(group => {
        const groupChannels = groupedChannels.get(group.id) || []
        if (groupChannels.length === 0) return null
        return (
          <div key={group.id} className="mb-4">
            <h3 className="group-header mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              {group.name}
            </h3>
            <div className="space-y-0.5">
              {groupChannels.map(ch => (
                <div key={ch.id} className="channel-row flex items-center justify-between rounded px-3 py-1.5 hover:bg-accent/30">
                  <span className="text-sm font-medium">{ch.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{ch.stage_port || '--'}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {ungrouped.length > 0 && (
        <div className="mb-4">
          <h3 className="group-header mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            Other
          </h3>
          <div className="space-y-0.5">
            {ungrouped.map(ch => (
              <div key={ch.id} className="channel-row flex items-center justify-between rounded px-3 py-1.5 hover:bg-accent/30">
                <span className="text-sm font-medium">{ch.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{ch.stage_port || '--'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {channels.length === 0 && (
        <p className="text-sm text-muted-foreground">No channels</p>
      )}
    </div>
  )
}
