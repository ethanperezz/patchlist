'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { Show } from '@/lib/types'

interface SharedUser {
  user_id: string
  permission: string
  user: { name: string | null; email: string | null }
}

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [show, setShow] = useState<Show | null>(null)
  const [name, setName] = useState('')
  const [venue, setVenue] = useState('')
  const [showDate, setShowDate] = useState('')
  const [eventType, setEventType] = useState('')
  const [saving, setSaving] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState('viewer')
  const [shareError, setShareError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: showData } = await supabase.from('shows').select('*').eq('id', id).single()
      if (showData) {
        setShow(showData)
        setName(showData.name)
        setVenue(showData.venue || '')
        setShowDate(showData.show_date || '')
        setEventType(showData.event_type || 'other')
      }

      const { data: users } = await supabase
        .from('show_users')
        .select('user_id, permission, user:users(name, email)')
        .eq('show_id', id)

      if (users) setSharedUsers(users as unknown as SharedUser[])
      setLoading(false)
    }
    load()
  }, [id, supabase])

  async function saveSettings() {
    setSaving(true)
    await supabase.from('shows').update({
      name: name.trim() || 'Untitled Show',
      venue: venue.trim() || null,
      show_date: showDate || null,
      event_type: eventType || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setSaving(false)
  }

  async function handleShare() {
    setShareError(null)
    if (!shareEmail.trim()) return

    // Find or create user by email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', shareEmail.trim())
      .single()

    if (!existingUser) {
      setShareError('No user found with that email. They must sign up first.')
      return
    }

    // Check if already shared
    const exists = sharedUsers.some(u => u.user_id === existingUser.id)
    if (exists) {
      setShareError('Already shared with this user.')
      return
    }

    const { error } = await supabase.from('show_users').insert({
      show_id: id,
      user_id: existingUser.id,
      permission: sharePermission,
    })

    if (error) {
      setShareError(error.message)
      return
    }

    // Refresh shared users
    const { data: users } = await supabase
      .from('show_users')
      .select('user_id, permission, user:users(name, email)')
      .eq('show_id', id)
    if (users) setSharedUsers(users as unknown as SharedUser[])
    setShareEmail('')
  }

  async function removeAccess(userId: string) {
    await supabase.from('show_users').delete().eq('show_id', id).eq('user_id', userId)
    setSharedUsers(prev => prev.filter(u => u.user_id !== userId))
  }

  async function deleteShow() {
    await supabase.from('shows').delete().eq('id', id)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-sm font-semibold">Show Settings</h2>

      {/* Show details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Show name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Venue</Label>
              <Input value={venue} onChange={e => setVenue(e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} className="text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Event type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="worship">Worship</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Share access */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              placeholder="user@example.com"
              className="text-sm"
              onKeyDown={e => { if (e.key === 'Enter') handleShare() }}
            />
            <Select value={sharePermission} onValueChange={setSharePermission}>
              <SelectTrigger className="w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleShare}>Share</Button>
          </div>
          {shareError && <p className="text-xs text-destructive">{shareError}</p>}

          <Separator />

          <div className="space-y-2">
            {sharedUsers.map(su => (
              <div key={su.user_id} className="flex items-center justify-between rounded border px-3 py-2">
                <div>
                  <span className="text-xs font-medium">{(su.user as any)?.name || 'Unknown'}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">{(su.user as any)?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{su.permission}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-destructive hover:text-destructive"
                    onClick={() => removeAccess(su.user_id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete show</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete show?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes &quot;{show?.name}&quot; and all its channels, mixes, and notes. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteShow} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
