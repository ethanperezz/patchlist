'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useShow } from '@/lib/hooks/use-show'
import { ChannelGroup } from '@/components/patch/ChannelGroup'
import { ChangelogDrawer } from '@/components/patch/ChangelogDrawer'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { AddChannelButton } from '@/components/patch/AddChannelButton'
import { BatchAddChannels } from '@/components/patch/BatchAddChannels'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/lib/types'

export default function FOHPage() {
  const { id } = useParams<{ id: string }>()
  const { show, channels, groups, mixes, mixNotes, wirelessEntries, changelog, unackedChangelog, isEditor, loading, setChannels, acknowledgeAll } = useShow(id)
  const addButtonRef = useRef<{ open: () => void }>(null)
  const [locked, setLocked] = useState(false)

  const editingEnabled = isEditor && !locked

  function handleUpdateChannel(updated: Channel) {
    setChannels(prev => prev.map(ch => ch.id === updated.id ? updated : ch))
  }

  function handleChannelAdded(channel: Channel) {
    setChannels(prev => {
      if (prev.some(ch => ch.id === channel.id)) return prev
      return [...prev, channel].sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  function handleBatchAdded(newChannels: Channel[]) {
    setChannels(prev => {
      const ids = new Set(prev.map(ch => ch.id))
      const unique = newChannels.filter(ch => !ids.has(ch.id))
      return [...prev, ...unique].sort((a, b) => a.sort_order - b.sort_order)
    })
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!editingEnabled) return

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        addButtonRef.current?.open()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingEnabled])

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
  const changeCount = new Set(unackedChangelog.map(c => c.channel_id).filter(Boolean)).size

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
          {isEditor && (
            <Button
              variant={locked ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-[11px] font-normal gap-1"
              onClick={() => setLocked(!locked)}
              title={locked ? 'Unlock for editing' : 'Lock to view-only'}
            >
              {locked ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
              )}
              {locked ? 'Locked' : 'Lock'}
            </Button>
          )}
          {editingEnabled && (
            <>
              <BatchAddChannels
                showId={id}
                groups={groups}
                channelCount={channels.length}
                onChannelsAdded={handleBatchAdded}
              />
              <AddChannelButton
                ref={addButtonRef}
                showId={id}
                groups={groups}
                channelCount={channels.length}
                onChannelAdded={handleChannelAdded}
              />
            </>
          )}
          <ChangelogDrawer changelog={changelog} unackedCount={unackedChangelog.length} onAcknowledgeAll={acknowledgeAll} />
          <PDFExportButton show={show} channels={channels} groups={groups} mixes={mixes} mixNotes={mixNotes} wirelessEntries={wirelessEntries} changelog={changelog} />
        </div>
      </div>

      {/* Keyboard hints */}
      {editingEnabled && (
        <div className="mb-3 flex items-center gap-4 text-[10px] text-muted-foreground/40 no-print">
          <span><kbd className="rounded border border-border/50 px-1 py-0.5 text-[9px] font-mono">Cmd+N</kbd> Add channel</span>
          <span>Type in any row to quick-add</span>
          <span>Enter to submit from name</span>
        </div>
      )}

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
      {orderedGroups.map((group) => (
        <ChannelGroup
          key={group.id}
          showId={id}
          group={group}
          channels={groupedChannels.get(group.id) || []}
          changelog={unackedChangelog}
          isEditor={editingEnabled}
          totalChannelCount={channels.length}
          onUpdateChannel={handleUpdateChannel}
          onChannelAdded={handleChannelAdded}
        />
      ))}

      {/* Ungrouped */}
      {(ungrouped.length > 0 || (groups.length === 0 && isEditor)) && (
        <ChannelGroup
          showId={id}
          group={null}
          channels={ungrouped}
          changelog={unackedChangelog}
          isEditor={editingEnabled}
          totalChannelCount={channels.length}
          onUpdateChannel={handleUpdateChannel}
          onChannelAdded={handleChannelAdded}
        />
      )}

      {channels.length === 0 && !isEditor && (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <p className="text-sm font-medium">No channels yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Waiting for the engineer to add channels
          </p>
        </div>
      )}
    </div>
  )
}
