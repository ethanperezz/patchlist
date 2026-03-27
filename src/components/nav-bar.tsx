'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function NavBar({ userName }: { userName?: string | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b no-print">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-bold tracking-tight">
          PatchList
        </Link>
        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-xs text-muted-foreground">{userName}</span>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs">
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  )
}
