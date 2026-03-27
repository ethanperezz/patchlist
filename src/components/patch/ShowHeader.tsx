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

export function ShowHeader({ show }: { show: Show }) {
  return (
    <>
      {/* Screen header */}
      <div className="no-print flex items-center gap-3 px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">{show.name}</h1>
        {show.venue && <span className="text-sm text-muted-foreground">{show.venue}</span>}
        {show.show_date && (
          <Badge variant="outline" className="text-[10px]">
            {formatDate(show.show_date)}
          </Badge>
        )}
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
