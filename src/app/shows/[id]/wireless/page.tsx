'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { WirelessTable } from '@/components/patch/WirelessTable'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { Skeleton } from '@/components/ui/skeleton'

export default function WirelessPage() {
  const { id } = useParams<{ id: string }>()
  const { show, channels, groups, mixes, mixNotes, wirelessEntries, changelog, loading } = useShow(id)

  if (loading) {
    return <Skeleton className="h-[300px]" />
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between no-print">
        <h2 className="text-sm font-semibold">Wireless</h2>
        <PDFExportButton show={show} channels={channels} groups={groups} mixes={mixes} mixNotes={mixNotes} wirelessEntries={wirelessEntries} changelog={changelog} />
      </div>
      <WirelessTable channels={channels} wirelessEntries={wirelessEntries} mixes={mixes} />
    </div>
  )
}
