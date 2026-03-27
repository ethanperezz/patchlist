'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChannelRow } from './ChannelRow'
import type { Channel, ChannelGroup as ChannelGroupType, ChangelogEntry } from '@/lib/types'

interface ChannelGroupProps {
  group: ChannelGroupType | null
  channels: Channel[]
  changelog: ChangelogEntry[]
  isEditor: boolean
  onUpdateChannel: (updated: Channel) => void
}

export function ChannelGroup({ group, channels, changelog, isEditor, onUpdateChannel }: ChannelGroupProps) {
  const [collapsed, setCollapsed] = useState(false)

  const groupChanges = new Map<string, ChangelogEntry[]>()
  for (const entry of changelog) {
    if (entry.channel_id) {
      const list = groupChanges.get(entry.channel_id) || []
      list.push(entry)
      groupChanges.set(entry.channel_id, list)
    }
  }

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group-header flex w-full items-center gap-2 px-2 py-1.5 text-left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('shrink-0 transition-transform', collapsed && '-rotate-90')}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group?.name || 'Ungrouped'}
        </span>
        <span className="text-[10px] text-muted-foreground/60">{channels.length}</span>
      </button>

      {!collapsed && (
        <div className="rounded border">
          {channels.map(ch => (
            <ChannelRow
              key={ch.id}
              channel={ch}
              changes={groupChanges.get(ch.id) || []}
              isEditor={isEditor}
              onUpdate={onUpdateChannel}
            />
          ))}
          {channels.length === 0 && (
            <p className="px-4 py-3 text-xs text-muted-foreground">No channels in this group</p>
          )}
        </div>
      )}
    </div>
  )
}
