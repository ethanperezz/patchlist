'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { MixCard } from '@/components/patch/MixCard'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { Skeleton } from '@/components/ui/skeleton'
import type { Mix } from '@/lib/types'

export default function MonitorPage() {
  const { id } = useParams<{ id: string }>()
  const { mixes, mixNotes, isEditor, loading, setMixes } = useShow(id)

  function handleUpdateMix(updated: Mix) {
    setMixes(prev => prev.map(m => m.id === updated.id ? updated : m))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between no-print">
        <h2 className="text-sm font-semibold">Monitor Mixes</h2>
        <PDFExportButton />
      </div>

      {mixes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No mixes configured for this show</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mixes.map(mix => (
            <MixCard
              key={mix.id}
              mix={mix}
              notes={mixNotes.filter(n => n.mix_id === mix.id)}
              isEditor={isEditor}
              onUpdate={handleUpdateMix}
            />
          ))}
        </div>
      )}
    </div>
  )
}
