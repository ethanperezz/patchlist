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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Shows</h1>
          <p className="text-sm text-muted-foreground">Your patch lists and show files</p>
        </div>
        <Link href="/shows/new">
          <Button size="sm">New show</Button>
        </Link>
      </div>

      {shows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No shows yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first show to get started
            </p>
            <Link href="/shows/new" className="mt-4">
              <Button size="sm" variant="outline">Create a show</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {shows.map(show => (
            <Link key={show.id} href={`/shows/${show.id}/foh`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{show.name}</span>
                      {show.event_type && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {eventTypeLabels[show.event_type] || show.event_type}
                        </Badge>
                      )}
                      {show.permission === 'viewer' && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          View only
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      {show.venue && <span>{show.venue}</span>}
                      {show.show_date && <span>{formatDate(show.show_date)}</span>}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
