'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/nav-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CSVImport } from '@/components/patch/csv-import'

export default function NewShowPage() {
  const [name, setName] = useState('')
  const [venue, setVenue] = useState('')
  const [showDate, setShowDate] = useState('')
  const [eventType, setEventType] = useState('worship')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function loadTemplates() {
    if (templatesLoaded) return
    const { data } = await supabase
      .from('shows')
      .select('id, name, event_type')
      .eq('is_template', true)
    setTemplates(data || [])
    setTemplatesLoaded(true)
  }

  // Helper: create show with client-generated UUID to avoid SELECT-after-INSERT RLS issue
  async function createShowRecord(userId: string): Promise<string | null> {
    const showId = crypto.randomUUID()

    // Insert show (no .select() — RLS blocks reading before show_users exists)
    const { error: showErr } = await supabase.from('shows').insert({
      id: showId,
      name: name || 'Untitled Show',
      venue: venue || null,
      show_date: showDate || null,
      event_type: eventType,
      created_by: userId,
    })

    if (showErr) {
      setError('Failed to create show: ' + showErr.message)
      return null
    }

    // Add creator as editor (must happen before any further reads)
    const { error: suErr } = await supabase.from('show_users').insert({
      show_id: showId,
      user_id: userId,
      permission: 'editor',
    })

    if (suErr) {
      setError('Failed to set permissions: ' + suErr.message)
      return null
    }

    return showId
  }

  async function createBlankShow() {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const showId = await createShowRecord(user.id)
    if (!showId) { setLoading(false); return }

    router.push(`/shows/${showId}/foh`)
  }

  async function cloneTemplate(templateId: string) {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const showId = await createShowRecord(user.id)
    if (!showId) { setLoading(false); return }

    // Clone channel groups
    const { data: srcGroups } = await supabase
      .from('channel_groups')
      .select('*')
      .eq('show_id', templateId)
      .order('sort_order')

    const groupMap: Record<string, string> = {}
    if (srcGroups && srcGroups.length > 0) {
      for (const g of srcGroups) {
        const newGroupId = crypto.randomUUID()
        await supabase.from('channel_groups').insert({
          id: newGroupId,
          show_id: showId,
          name: g.name,
          sort_order: g.sort_order,
        })
        groupMap[g.id] = newGroupId
      }
    }

    // Clone channels
    const { data: srcChannels } = await supabase
      .from('channels')
      .select('*')
      .eq('show_id', templateId)
      .order('sort_order')

    if (srcChannels && srcChannels.length > 0) {
      await supabase.from('channels').insert(
        srcChannels.map(ch => ({
          show_id: showId,
          channel_number: ch.channel_number,
          name: ch.name,
          stage_port: ch.stage_port,
          input_type: ch.input_type,
          mic_model: ch.mic_model,
          phantom_48v: ch.phantom_48v,
          notes: ch.notes,
          sort_order: ch.sort_order,
          group_id: ch.group_id ? groupMap[ch.group_id] || null : null,
        }))
      )
    }

    // Clone mixes
    const { data: srcMixes } = await supabase
      .from('mixes')
      .select('*')
      .eq('show_id', templateId)
      .order('sort_order')

    if (srcMixes && srcMixes.length > 0) {
      await supabase.from('mixes').insert(
        srcMixes.map(m => ({
          show_id: showId,
          mix_number: m.mix_number,
          name: m.name,
          type: m.type,
          system: m.system,
          position: m.position,
          sort_order: m.sort_order,
          feeds: m.feeds,
        }))
      )
    }

    router.push(`/shows/${showId}/foh`)
  }

  async function handleCSVImport(rows: any[]) {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const showId = await createShowRecord(user.id)
    if (!showId) { setLoading(false); return }

    await supabase.from('channels').insert(
      rows.map((row, i) => ({
        show_id: showId,
        channel_number: row.channel_number || i + 1,
        name: row.name || `Ch ${i + 1}`,
        stage_port: row.stage_port || null,
        input_type: row.input_type || null,
        mic_model: row.mic_model || null,
        phantom_48v: row.phantom_48v === 'true' || row.phantom_48v === true,
        notes: row.notes || null,
        sort_order: i,
      }))
    )

    router.push(`/shows/${showId}/foh`)
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl p-4 pt-6">
        <h1 className="mb-6 text-xl font-bold tracking-tight">New Show</h1>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Show name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Sunday Service" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Main Auditorium" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={showDate} onChange={e => setShowDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="worship">Worship</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="blank" onValueChange={(v) => { if (v === 'template') loadTemplates() }}>
          <TabsList className="w-full">
            <TabsTrigger value="blank" className="flex-1">Blank</TabsTrigger>
            <TabsTrigger value="template" className="flex-1">From template</TabsTrigger>
            <TabsTrigger value="csv" className="flex-1">CSV import</TabsTrigger>
          </TabsList>

          <TabsContent value="blank">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Start with an empty channel list and build your patch from scratch.
                </p>
                <Button onClick={createBlankShow} disabled={loading}>
                  {loading ? 'Creating...' : 'Create show'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Clone channels and mixes from a built-in template.
                </p>
                <div className="space-y-2">
                  {templates.map(t => (
                    <Button
                      key={t.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => cloneTemplate(t.id)}
                      disabled={loading}
                    >
                      {t.name}
                    </Button>
                  ))}
                  {templatesLoaded && templates.length === 0 && (
                    <p className="text-sm text-muted-foreground">No templates available. Run the migration first.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import from CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <CSVImport onImport={handleCSVImport} disabled={loading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
