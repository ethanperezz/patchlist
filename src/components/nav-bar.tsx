'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'

export function NavBar({ userName }: { userName?: string | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md no-print">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center">
          <Image
            src="/logo.png"
            alt="PatchList"
            width={100}
            height={100}
            className="dark:invert-0 invert h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </Link>
        <div className="flex items-center gap-1">
          {userName && (
            <span className="mr-2 text-[11px] text-muted-foreground tracking-tight">{userName}</span>
          )}
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  )
}
