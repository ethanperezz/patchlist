'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { ChannelGroup } from '@/components/patch/ChannelGroup'
import { ChangelogDrawer } from '@/components/patch/ChangelogDrawer'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { AddChannelButton } from '@/components/patch/AddChannelButton'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/lib/types'

export default function FOHPage() {
  const { id } = useParams<{ id: string }>()
  const { channels, groups, changelog, isEditor, loading, setChannels } = useShow(id)

  function handleUpdateChannel(updated: Channel) {
    setChannels(prev => prev.map(ch => ch.id === updated.id ? updated : ch))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  // Group channels
  const groupedChannels = new Map<string | null, Channel[]>()
  for (const ch of channels) {
    const key = ch.group_id
    if (!groupedChannels.has(key)) groupedChannels.set(key, [])
    groupedChannels.get(key)!.push(ch)
  }

  // Order groups by sort_order, ungrouped last
  const orderedGroups = [...groups]
  const ungrouped = groupedChannels.get(null) || []

  const wirelessCount = channels.filter(ch => ch.input_type === 'wireless').length
  const changeCount = new Set(changelog.map(c => c.channel_id).filter(Boolean)).size

  return (
    <div>
      {/* Stats row */}
      <div className="mb-4 flex flex-wrap items-center gap-4 no-print">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-muted-foreground">Inputs: </span>
            <span className="font-medium">{channels.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Wireless: </span>
            <span className="font-medium">{wirelessCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Changes: </span>
            {changeCount > 0 ? (
              <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">{changeCount}</Badge>
            ) : (
              <span className="font-medium">0</span>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isEditor && <AddChannelButton showId={id} groups={groups} channelCount={channels.length} />}
          <ChangelogDrawer changelog={changelog} />
          <PDFExportButton />
        </div>
      </div>

      {/* Column header */}
      <div className="mb-1 grid grid-cols-[3rem_1fr_5rem_4rem_6rem_2rem_1fr] gap-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-right pr-2">Ch</span>
        <span>Name</span>
        <span>Port</span>
        <span>Type</span>
        <span>Mic</span>
        <span className="text-center">48V</span>
        <span>Notes</span>
      </div>

      {/* Grouped channels */}
      {orderedGroups.map(group => (
        <ChannelGroup
          key={group.id}
          group={group}
          channels={groupedChannels.get(group.id) || []}
          changelog={changelog}
          isEditor={isEditor}
          onUpdateChannel={handleUpdateChannel}
        />
      ))}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <ChannelGroup
          group={null}
          channels={ungrouped}
          changelog={changelog}
          isEditor={isEditor}
          onUpdateChannel={handleUpdateChannel}
        />
      )}

      {channels.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">No channels yet</p>
          {isEditor && (
            <p className="mt-1 text-xs text-muted-foreground">
              Add your first channel to start building the patch list
            </p>
          )}
        </div>
      )}
    </div>
  )
}
