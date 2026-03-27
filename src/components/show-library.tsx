'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ShowWithPermission } from '@/lib/types'

const eventTypeLabels: Record<string, string> = {
  worship: 'Worship',
  concert: 'Concert',
  corporate: 'Corporate',
  other: 'Other',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ShowLibrary({ shows }: { shows: ShowWithPermission[] }) {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {shows.length === 0 ? 'Your patch lists and show files' : `${shows.length} show${shows.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link href="/shows/new">
          <Button size="sm" className="h-8 px-3 text-xs font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New show
          </Button>
        </Link>
      </div>

      {shows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-sm font-medium">No shows yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
              Create your first show to start building a patch list
            </p>
            <Link href="/shows/new" className="mt-5">
              <Button size="sm" variant="outline" className="h-8 text-xs">Create a show</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {shows.map(show => (
            <Link key={show.id} href={`/shows/${show.id}/foh`} className="block">
              <Card className="group cursor-pointer border-border/50 transition-all duration-150 hover:border-border hover:bg-accent/40 hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                        {show.name}
                      </span>
                      {show.event_type && (
                        <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                          {eventTypeLabels[show.event_type] || show.event_type}
                        </Badge>
                      )}
                      {show.permission === 'viewer' && (
                        <Badge variant="outline" className="text-[10px] shrink-0 font-normal text-muted-foreground">
                          View only
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      {show.venue && <span>{show.venue}</span>}
                      {show.venue && show.show_date && <span className="text-border">|</span>}
                      {show.show_date && <span className="tabular-nums">{formatDate(show.show_date)}</span>}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
