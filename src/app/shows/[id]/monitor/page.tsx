'use client'

import { useParams } from 'next/navigation'
import { useShow } from '@/lib/hooks/use-show'
import { MixCard } from '@/components/patch/MixCard'
import { AddMixButton } from '@/components/patch/AddMixButton'
import { PDFExportButton } from '@/components/patch/PDFExportButton'
import { Skeleton } from '@/components/ui/skeleton'
import type { Mix } from '@/lib/types'

export default function MonitorPage() {
  const { id } = useParams<{ id: string }>()
  const { show, channels, groups, mixes, mixNotes, wirelessEntries, changelog, isEditor, loading, setMixes } = useShow(id)

  function handleUpdateMix(updated: Mix) {
    setMixes(prev => prev.map(m => m.id === updated.id ? updated : m))
  }

  function handleMixAdded(mix: Mix) {
    setMixes(prev => {
      if (prev.some(m => m.id === mix.id)) return prev
      return [...prev, mix].sort((a, b) => a.sort_order - b.sort_order)
    })
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
        <div className="flex items-center gap-2">
          {isEditor && (
            <AddMixButton showId={id} mixCount={mixes.length} onMixAdded={handleMixAdded} />
          )}
          <PDFExportButton show={show} channels={channels} groups={groups} mixes={mixes} mixNotes={mixNotes} wirelessEntries={wirelessEntries} changelog={changelog} />
        </div>
      </div>

      {mixes.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <p className="text-sm font-medium">No mixes yet</p>
          {isEditor && (
            <p className="mt-1 text-xs text-muted-foreground">
              Add wedge, IEM, FX, or matrix mixes
            </p>
          )}
        </div>
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
