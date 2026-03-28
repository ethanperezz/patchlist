'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ChannelRow } from './ChannelRow'
import { QuickAddRow } from './QuickAddRow'
import type { Channel, ChannelGroup as ChannelGroupType, ChangelogEntry } from '@/lib/types'

interface ChannelGroupProps {
  showId: string
  group: ChannelGroupType | null
  channels: Channel[]
  changelog: ChangelogEntry[]
  isEditor: boolean
  totalChannelCount: number
  onUpdateChannel: (updated: Channel) => void
  onChannelAdded: (channel: Channel) => void
}

export function ChannelGroup({ showId, group, channels, changelog, isEditor, totalChannelCount, onUpdateChannel, onChannelAdded }: ChannelGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClient()

  function addBlankRow() {
    const id = crypto.randomUUID()
    const blank: Channel = {
      id,
      show_id: showId,
      channel_number: totalChannelCount + 1,
      name: '',
      stage_port: null,
      input_type: null,
      mic_model: null,
      phantom_48v: false,
      notes: null,
      sort_order: totalChannelCount,
      group_id: group?.id || null,
    }
    onChannelAdded(blank)
    supabase.from('channels').insert({
      id, show_id: showId, channel_number: blank.channel_number,
      name: '', group_id: blank.group_id, sort_order: blank.sort_order,
    })
  }

  const groupChanges = new Map<string, ChangelogEntry[]>()
  for (const entry of changelog) {
    if (entry.channel_id) {
      const list = groupChanges.get(entry.channel_id) || []
      list.push(entry)
      groupChanges.set(entry.channel_id, list)
    }
  }

  const changedCount = channels.filter(ch => groupChanges.has(ch.id)).length

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group-header-bar cursor-pointer transition-colors hover:bg-muted/80"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('shrink-0 text-muted-foreground transition-transform duration-150', collapsed && '-rotate-90')}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {group?.name || 'Ungrouped'}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground/50">{channels.length}</span>
        {changedCount > 0 && (
          <span className="ml-auto text-[10px] font-medium tabular-nums" style={{ color: 'var(--changed)' }}>
            {changedCount} changed
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="rounded-b-md border border-t-0 divide-y divide-border/50">
          {channels.map(ch => (
            <ChannelRow
              key={ch.id}
              channel={ch}
              changes={groupChanges.get(ch.id) || []}
              isEditor={isEditor}
              onUpdate={onUpdateChannel}
            />
          ))}
          {channels.length === 0 && !isEditor && (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground/60">No channels in this group</p>
          )}
          {isEditor && (
            <>
              <QuickAddRow
                showId={showId}
                groupId={group?.id || null}
                channelCount={totalChannelCount}
                onChannelAdded={onChannelAdded}
              />
              <div className="flex items-center px-3 py-1">
                <button
                  onClick={addBlankRow}
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                  + Blank row
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
