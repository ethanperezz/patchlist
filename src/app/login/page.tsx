'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Subtle background texture */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--muted))_0%,transparent_70%)] opacity-50" />

      <div className="mb-8">
        <Image src="/logo.png" alt="PatchList" width={200} height={200} className="dark:invert-0 invert h-24 w-auto" />
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-base font-semibold">Sign in</CardTitle>
          <CardDescription className="text-xs">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
            <Button type="submit" className="w-full h-9 text-sm font-medium" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-[10px] text-muted-foreground/50">
        Live production patch list manager
      </p>
    </div>
  )
}
