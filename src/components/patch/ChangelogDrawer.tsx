'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ChangelogEntry } from '@/lib/types'

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface ChangelogDrawerProps {
  changelog: ChangelogEntry[]
  unackedCount: number
  onAcknowledgeAll: () => void
}

export function ChangelogDrawer({ changelog, unackedCount, onAcknowledgeAll }: ChangelogDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="no-print h-8 text-[11px] gap-1.5 font-normal">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          Changelog
          {unackedCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-0.5 h-4 min-w-4 px-1 text-[9px] font-bold tabular-nums"
            >
              {unackedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[460px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-semibold">Change Log</SheetTitle>
            {unackedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px]"
                onClick={onAcknowledgeAll}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                Acknowledge all ({unackedCount})
              </Button>
            )}
          </div>
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
              {changelog.map(entry => {
                const isAcked = unackedCount === 0 || !entry.changed_at
                return (
                  <div
                    key={entry.id}
                    className={`rounded-md border p-3 transition-colors hover:bg-accent/30 ${
                      isAcked ? 'border-border/30 opacity-50' : 'border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isAcked && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--changed)] shrink-0" />
                        )}
                        <span className="text-xs font-medium">
                          {(entry.channel as any)?.name || 'Unknown channel'}
                        </span>
                      </div>
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
                )
              })}

              {unackedCount > 0 && unackedCount < changelog.length && (
                <div className="flex items-center gap-2 py-2">
                  <Separator className="flex-1" />
                  <span className="text-[10px] text-muted-foreground/40 shrink-0">Previously acknowledged</span>
                  <Separator className="flex-1" />
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
