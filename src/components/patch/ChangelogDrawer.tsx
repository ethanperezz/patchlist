'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChangelogEntry } from '@/lib/types'

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ChangelogDrawer({ changelog }: { changelog: ChangelogEntry[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="no-print text-xs gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          Changelog
          {changelog.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
              {changelog.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-sm">Change Log</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] mt-4">
          {changelog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes recorded</p>
          ) : (
            <div className="space-y-3">
              {changelog.map(entry => (
                <div key={entry.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {(entry.channel as any)?.name || 'Unknown channel'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(entry.changed_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{entry.field_changed}</span>:{' '}
                    <span className="line-through">{entry.previous_value || '(empty)'}</span>{' '}
                    &rarr; {entry.new_value || '(empty)'}
                  </p>
                  {(entry.user as any)?.name && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      by {(entry.user as any).name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
