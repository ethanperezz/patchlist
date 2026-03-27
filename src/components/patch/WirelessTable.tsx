'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Channel, Wireless, Mix } from '@/lib/types'

interface WirelessTableProps {
  channels: Channel[]
  wirelessEntries: Wireless[]
  mixes: Mix[]
}

export function WirelessTable({ channels, wirelessEntries, mixes }: WirelessTableProps) {
  const wirelessChannels = channels
    .filter(ch => ch.input_type === 'wireless')
    .sort((a, b) => a.channel_number - b.channel_number)

  // Separate IEM systems from wireless mics
  const iemMixes = mixes.filter(m => m.type === 'iem')

  // Build wireless rows with frequency sorting
  const rows = wirelessChannels.map(ch => {
    const w = wirelessEntries.find(we => we.channel_id === ch.id)
    return { channel: ch, wireless: w }
  }).sort((a, b) => {
    const freqA = a.wireless?.frequency || 0
    const freqB = b.wireless?.frequency || 0
    return freqA - freqB
  })

  return (
    <div>
      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[3rem]">Ch #</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">System</TableHead>
              <TableHead className="text-xs">Pack ID</TableHead>
              <TableHead className="text-xs">Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                  No wireless channels
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ channel, wireless }) => (
                <TableRow key={channel.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground">{channel.channel_number}</TableCell>
                  <TableCell className="text-xs font-medium">{channel.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{wireless?.system || '--'}</TableCell>
                  <TableCell className="text-xs font-mono">{wireless?.pack_id || '--'}</TableCell>
                  <TableCell>
                    {wireless?.frequency ? (
                      <Badge variant="outline" className="font-mono text-[10px] text-[var(--badge-wireless)] border-[var(--badge-wireless)]/30">
                        {Number(wireless.frequency).toFixed(3)} MHz
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* IEM systems */}
      {iemMixes.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            IEM Systems
          </h3>
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Mix</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">System</TableHead>
                  <TableHead className="text-xs">Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {iemMixes.map(mix => (
                  <TableRow key={mix.id}>
                    <TableCell className="text-xs font-mono">{mix.mix_number}</TableCell>
                    <TableCell className="text-xs font-medium">{mix.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{mix.system || '--'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{mix.position || '--'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
