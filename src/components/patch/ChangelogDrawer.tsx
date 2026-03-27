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
        <Button variant="outline" size="sm" className="no-print h-8 text-[11px] gap-1.5 font-normal">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          Changelog
          {changelog.length > 0 && (
            <Badge
              variant="destructive"
              className="ml-0.5 h-4 min-w-4 px-1 text-[9px] font-bold tabular-nums"
            >
              {changelog.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[460px]">
        <SheetHeader>
          <SheetTitle className="text-sm font-semibold">Change Log</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] mt-4 pr-2">
          {changelog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <p className="text-xs text-muted-foreground">No changes recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {changelog.map(entry => (
                <div key={entry.id} className="rounded-md border border-border/50 p-3 transition-colors hover:bg-accent/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {(entry.channel as any)?.name || 'Unknown channel'}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/60">
                      {formatTime(entry.changed_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground/80">{entry.field_changed}</span>:{' '}
                    <span className="line-through opacity-50">{entry.previous_value || '(empty)'}</span>{' '}
                    <span className="text-muted-foreground/40">&rarr;</span>{' '}
                    <span className="text-foreground/90">{entry.new_value || '(empty)'}</span>
                  </p>
                  {(entry.user as any)?.name && (
                    <p className="mt-1 text-[10px] text-muted-foreground/50">
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
