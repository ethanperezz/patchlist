'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'FOH', href: 'foh' },
  { label: 'Monitor', href: 'monitor' },
  { label: 'Stage Tech', href: 'tech' },
  { label: 'Wireless', href: 'wireless' },
  { label: 'Band', href: 'band' },
  { label: 'Settings', href: 'settings' },
]

export function RoleTabBar({ showId, isEditor }: { showId: string; isEditor: boolean }) {
  const pathname = usePathname()
  const activePath = pathname.split('/').pop()

  const visibleTabs = isEditor ? tabs : tabs.filter(t => t.href !== 'settings')

  return (
    <div className="tabs-nav sticky top-16 z-40 border-b bg-background/80 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-4">
        {visibleTabs.map(tab => (
          <Link
            key={tab.href}
            href={`/shows/${showId}/${tab.href}`}
            className={cn(
              'relative shrink-0 px-3 py-2.5 text-[11px] font-medium tracking-wide transition-colors',
              activePath === tab.href
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80'
            )}
          >
            {tab.label}
            {activePath === tab.href && (
              <span className="absolute inset-x-3 -bottom-px h-[1.5px] bg-foreground rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
