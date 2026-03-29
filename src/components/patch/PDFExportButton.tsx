'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Show, Channel, ChannelGroup, Mix, MixNote, Wireless, ChangelogEntry } from '@/lib/types'

type ViewKey = 'foh' | 'monitor' | 'tech' | 'wireless' | 'band'

const VIEW_OPTIONS: { key: ViewKey; label: string; description: string }[] = [
  { key: 'foh', label: 'FOH', description: 'Full channel list with all details' },
  { key: 'monitor', label: 'Monitor', description: 'Mixes with feeds and notes' },
  { key: 'tech', label: 'Stage Tech', description: 'Mics needed, DIs, wireless' },
  { key: 'wireless', label: 'Wireless', description: 'Frequencies and pack IDs' },
  { key: 'band', label: 'Band', description: 'Channel names and stage ports only' },
]

interface PDFExportProps {
  show: Show | null
  channels: Channel[]
  groups: ChannelGroup[]
  mixes: Mix[]
  mixNotes: MixNote[]
  wirelessEntries: Wireless[]
  changelog: ChangelogEntry[]
}

export function PDFExportButton({ show, channels, groups, mixes, mixNotes, wirelessEntries, changelog }: PDFExportProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<ViewKey>>(new Set<ViewKey>(['foh']))
  const printRef = useRef<HTMLDivElement>(null)

  function toggle(key: ViewKey) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(VIEW_OPTIONS.map(v => v.key)))
  }

  function handlePrint() {
    setOpen(false)
    // Small delay to let dialog close before print
    setTimeout(() => window.print(), 150)
  }

  // Group channels helper
  function getGroupedChannels() {
    const grouped = new Map<string | null, Channel[]>()
    for (const ch of channels) {
      const key = ch.group_id
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(ch)
    }
    return grouped
  }

  const groupedChannels = getGroupedChannels()
  const orderedGroups = [...groups]
  const ungrouped = groupedChannels.get(null) || []
  const wirelessChannels = channels.filter(ch => ch.input_type === 'wireless')
  const micChannels = channels.filter(ch => ch.input_type === 'xlr_mic')
  const diChannels = channels.filter(ch => ch.input_type === 'di')
  const iemMixes = mixes.filter(m => m.type === 'iem')

  const formatDate = (d: string | null) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="no-print h-8 text-[11px] font-normal">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Print / Export PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Select which views to include. Each prints as a separate section with its own header.
            </p>
            <div className="space-y-1">
              {VIEW_OPTIONS.map(v => (
                <label
                  key={v.key}
                  className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(v.key)}
                    onChange={() => toggle(v.key)}
                    className="h-3.5 w-3.5 rounded border-border accent-foreground"
                  />
                  <div>
                    <span className="text-xs font-medium">{v.label}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">{v.description}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={selectAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Select all
              </button>
              <Button onClick={handlePrint} size="sm" disabled={selected.size === 0}>
                Print {selected.size} view{selected.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden printable content — only visible in @media print */}
      <div ref={printRef} className="hidden print:block" id="print-content">
        {Array.from(selected).map((viewKey, viewIndex) => (
          <div key={viewKey} className={viewIndex > 0 ? 'break-before-page' : ''}>
            {/* Section header */}
            <div className="print-header" style={{ display: 'block' }}>
              <h1>{show?.name || 'Show'}</h1>
              <div className="print-meta">
                {show?.venue && <span>{show.venue}</span>}
                {show?.show_date && <span> | {formatDate(show.show_date)}</span>}
                <span> | {VIEW_OPTIONS.find(v => v.key === viewKey)?.label} View</span>
                <span> | Printed {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* FOH View */}
            {viewKey === 'foh' && (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '3rem' }}>Ch</th>
                      <th>Name</th>
                      <th>Port</th>
                      <th>Type</th>
                      <th>Mic</th>
                      <th style={{ width: '3rem' }}>48V</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedGroups.map(group => {
                      const gChannels = groupedChannels.get(group.id) || []
                      return [
                        <tr key={`g-${group.id}`}>
                          <td colSpan={7} style={{ fontWeight: 700, backgroundColor: '#f0f0f0', textTransform: 'uppercase', fontSize: '9pt', letterSpacing: '0.05em' }}>
                            {group.name} ({gChannels.length})
                          </td>
                        </tr>,
                        ...gChannels.map(ch => {
                          const changed = changelog.some(c => c.channel_id === ch.id)
                          return (
                            <tr key={ch.id} className={changed ? 'changed' : ''} style={changed ? { borderLeft: '3pt solid #c00' } : undefined}>
                              <td style={{ fontFamily: 'monospace', textAlign: 'right' }}>{ch.channel_number}</td>
                              <td style={{ fontWeight: 500 }}>
                                {ch.name}
                                {changed && <span className="changed-label" style={{ marginLeft: '6pt' }}>CHANGED</span>}
                              </td>
                              <td style={{ fontFamily: 'monospace' }}>{ch.stage_port || ''}</td>
                              <td>{ch.input_type?.replace('_', ' ').toUpperCase() || ''}</td>
                              <td>{ch.mic_model || ''}</td>
                              <td style={{ textAlign: 'center' }}>{ch.phantom_48v ? '48V' : ''}</td>
                              <td>{ch.notes || ''}</td>
                            </tr>
                          )
                        }),
                      ]
                    })}
                    {ungrouped.length > 0 && [
                      <tr key="g-ungrouped">
                        <td colSpan={7} style={{ fontWeight: 700, backgroundColor: '#f0f0f0', textTransform: 'uppercase', fontSize: '9pt' }}>
                          Other ({ungrouped.length})
                        </td>
                      </tr>,
                      ...ungrouped.map(ch => (
                        <tr key={ch.id}>
                          <td style={{ fontFamily: 'monospace', textAlign: 'right' }}>{ch.channel_number}</td>
                          <td style={{ fontWeight: 500 }}>{ch.name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{ch.stage_port || ''}</td>
                          <td>{ch.input_type?.replace('_', ' ').toUpperCase() || ''}</td>
                          <td>{ch.mic_model || ''}</td>
                          <td style={{ textAlign: 'center' }}>{ch.phantom_48v ? '48V' : ''}</td>
                          <td>{ch.notes || ''}</td>
                        </tr>
                      )),
                    ]}
                  </tbody>
                </table>
              </div>
            )}

            {/* Monitor View */}
            {viewKey === 'monitor' && (
              <div>
                {mixes.map(mix => (
                  <div key={mix.id} style={{ marginBottom: '16pt' }}>
                    <div style={{ fontWeight: 700, fontSize: '11pt', borderBottom: '1pt solid #000', paddingBottom: '2pt', marginBottom: '4pt' }}>
                      {mix.mix_number} &mdash; {mix.name}
                      <span style={{ fontWeight: 400, fontSize: '9pt', marginLeft: '8pt', color: '#666' }}>
                        {mix.type?.toUpperCase()} {mix.system && `| ${mix.system}`} {mix.position && `| ${mix.position}`}
                      </span>
                    </div>
                    {mix.feeds && mix.feeds.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: '4pt' }}>
                        <span style={{ color: '#666' }}>Feeds: </span>
                        {mix.feeds.join(', ')}
                      </div>
                    )}
                    {mixNotes.filter(n => n.mix_id === mix.id).map(note => (
                      <div key={note.id} style={{ fontSize: '9pt', color: '#444', paddingLeft: '8pt', borderLeft: '2pt solid #ddd', marginTop: '2pt' }}>
                        {note.body}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Stage Tech View */}
            {viewKey === 'tech' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12pt' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                    Mics Needed ({micChannels.length})
                  </div>
                  {micChannels.map(ch => (
                    <div key={ch.id} style={{ fontSize: '9pt', display: 'flex', justifyContent: 'space-between', padding: '1pt 0' }}>
                      <span>{ch.name}</span>
                      <span style={{ color: '#666' }}>{ch.mic_model || ''}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                    DIs Needed ({diChannels.length})
                  </div>
                  {diChannels.map(ch => (
                    <div key={ch.id} style={{ fontSize: '9pt', padding: '1pt 0' }}>{ch.name}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                    Wireless ({wirelessChannels.length})
                  </div>
                  {wirelessChannels.map(ch => {
                    const w = wirelessEntries.find(we => we.channel_id === ch.id)
                    return (
                      <div key={ch.id} style={{ fontSize: '9pt', display: 'flex', justifyContent: 'space-between', padding: '1pt 0' }}>
                        <span>{ch.name}</span>
                        <span style={{ fontFamily: 'monospace', color: '#666' }}>{w?.pack_id || ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Wireless View */}
            {viewKey === 'wireless' && (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Ch #</th>
                      <th>Name</th>
                      <th>System</th>
                      <th>Pack ID</th>
                      <th>Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wirelessChannels
                      .sort((a, b) => a.channel_number - b.channel_number)
                      .map(ch => {
                        const w = wirelessEntries.find(we => we.channel_id === ch.id)
                        return (
                          <tr key={ch.id}>
                            <td style={{ fontFamily: 'monospace' }}>{ch.channel_number}</td>
                            <td style={{ fontWeight: 500 }}>{ch.name}</td>
                            <td>{w?.system || ''}</td>
                            <td style={{ fontFamily: 'monospace' }}>{w?.pack_id || ''}</td>
                            <td style={{ fontFamily: 'monospace' }}>{w?.frequency ? `${Number(w.frequency).toFixed(3)} MHz` : ''}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
                {iemMixes.length > 0 && (
                  <div style={{ marginTop: '16pt' }}>
                    <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                      IEM Systems
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Mix</th>
                          <th>Name</th>
                          <th>System</th>
                          <th>Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iemMixes.map(m => (
                          <tr key={m.id}>
                            <td style={{ fontFamily: 'monospace' }}>{m.mix_number}</td>
                            <td style={{ fontWeight: 500 }}>{m.name}</td>
                            <td>{m.system || ''}</td>
                            <td>{m.position || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Band View */}
            {viewKey === 'band' && (
              <div>
                {orderedGroups.map(group => {
                  const gChannels = groupedChannels.get(group.id) || []
                  if (gChannels.length === 0) return null
                  return (
                    <div key={group.id} style={{ marginBottom: '12pt' }}>
                      <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                        {group.name}
                      </div>
                      {gChannels.map(ch => (
                        <div key={ch.id} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', padding: '2pt 0', borderBottom: '0.5pt solid #eee' }}>
                          <span style={{ fontWeight: 500 }}>{ch.name}</span>
                          <span style={{ fontFamily: 'monospace', color: '#666' }}>{ch.stage_port || ''}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
                {ungrouped.length > 0 && (
                  <div style={{ marginBottom: '12pt' }}>
                    <div style={{ fontWeight: 700, fontSize: '10pt', borderBottom: '1pt solid #000', marginBottom: '4pt', textTransform: 'uppercase' }}>
                      Other
                    </div>
                    {ungrouped.map(ch => (
                      <div key={ch.id} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', padding: '2pt 0', borderBottom: '0.5pt solid #eee' }}>
                        <span style={{ fontWeight: 500 }}>{ch.name}</span>
                        <span style={{ fontFamily: 'monospace', color: '#666' }}>{ch.stage_port || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
