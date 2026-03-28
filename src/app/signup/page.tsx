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

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        name,
        email,
        role: 'engineer',
      })
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--muted))_0%,transparent_70%)] opacity-50" />

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="PatchList" width={32} height={32} className="dark:invert-0 invert" />
        <span className="text-lg font-bold tracking-tight">PatchList</span>
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-base font-semibold">Create account</CardTitle>
          <CardDescription className="text-xs">Get started with PatchList</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoFocus className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-9 text-sm" />
            </div>
            <Button type="submit" className="w-full h-9 text-sm font-medium" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
