'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'FOH', href: 'foh' },
  { label: 'Monitor', href: 'monitor' },
  { label: 'Tech', href: 'tech' },
  { label: 'Wireless', href: 'wireless' },
  { label: 'Band', href: 'band' },
  { label: 'Settings', href: 'settings' },
]

export function RoleTabBar({ showId, isEditor }: { showId: string; isEditor: boolean }) {
  const pathname = usePathname()
  const activePath = pathname.split('/').pop()

  const visibleTabs = isEditor ? tabs : tabs.filter(t => t.href !== 'settings')

  return (
    <div className="tabs-nav border-b no-print">
      <div className="mx-auto flex max-w-7xl gap-0 overflow-x-auto px-4">
        {visibleTabs.map(tab => (
          <Link
            key={tab.href}
            href={`/shows/${showId}/${tab.href}`}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              activePath === tab.href
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
