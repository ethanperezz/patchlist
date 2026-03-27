'use client'

import { Badge } from '@/components/ui/badge'
import type { Show } from '@/lib/types'

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const eventLabels: Record<string, string> = {
  worship: 'Worship',
  concert: 'Concert',
  corporate: 'Corporate',
  other: 'Other',
}

export function ShowHeader({ show }: { show: Show }) {
  return (
    <>
      {/* Screen header */}
      <div className="no-print border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <h1 className="text-base font-bold tracking-tight">{show.name}</h1>
          <span className="text-[11px] text-muted-foreground">{show.venue}</span>
          {show.show_date && (
            <Badge variant="outline" className="text-[10px] font-normal tabular-nums text-muted-foreground">
              {formatDate(show.show_date)}
            </Badge>
          )}
          {show.event_type && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {eventLabels[show.event_type] || show.event_type}
            </Badge>
          )}
        </div>
      </div>

      {/* Print header */}
      <div className="print-header hidden">
        <h1>{show.name}</h1>
        <div className="print-meta">
          {show.venue && <span>{show.venue}</span>}
          {show.show_date && <span> | {formatDate(show.show_date)}</span>}
          <span> | Printed {new Date().toLocaleString()}</span>
        </div>
      </div>
    </>
  )
}
