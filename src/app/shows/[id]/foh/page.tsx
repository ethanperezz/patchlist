'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { ChannelGroup } from '@/components/patch/ChannelGroup'
import { ChangelogDrawer } from '@/components/patch/ChangelogDrawer'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { AddChannelButton } from '@/components/patch/AddChannelButton'
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
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[120px] w-full" />
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

  const orderedGroups = [...groups]
  const ungrouped = groupedChannels.get(null) || []

  const wirelessCount = channels.filter(ch => ch.input_type === 'wireless').length
  const changeCount = new Set(changelog.map(c => c.channel_id).filter(Boolean)).size

  return (
    <div>
      {/* Stats + actions row */}
      <div className="mb-5 flex flex-wrap items-center gap-3 no-print">
        <div className="stat-pill bg-card">
          <span className="text-muted-foreground">Inputs</span>
          <span className="font-semibold tabular-nums">{channels.length}</span>
        </div>
        <div className="stat-pill bg-card">
          <span className="text-muted-foreground">Wireless</span>
          <span className="font-semibold tabular-nums">{wirelessCount}</span>
        </div>
        <div className={`stat-pill ${changeCount > 0 ? 'border-[var(--changed)]/30 bg-[var(--changed-bg)]' : 'bg-card'}`}>
          <span className={changeCount > 0 ? 'text-[var(--changed)]' : 'text-muted-foreground'}>Changes</span>
          <span className={`font-semibold tabular-nums ${changeCount > 0 ? 'text-[var(--changed)]' : ''}`}>{changeCount}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isEditor && <AddChannelButton showId={id} groups={groups} channelCount={channels.length} />}
          <ChangelogDrawer changelog={changelog} />
          <PDFExportButton />
        </div>
      </div>

      {/* Column header */}
      <div className="mb-1 grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_6rem_2rem_1fr] gap-2 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
        <span className="text-right pr-1">Ch</span>
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
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <p className="text-sm font-medium">No channels yet</p>
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
