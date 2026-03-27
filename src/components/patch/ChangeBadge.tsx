import { cn } from '@/lib/utils'
import type { InputType, MixType } from '@/lib/types'

const inputTypeConfig: Record<InputType, { label: string; className: string }> = {
  xlr_mic: { label: 'XLR', className: 'bg-[var(--badge-xlr)]/15 text-[var(--badge-xlr)] border-[var(--badge-xlr)]/30' },
  di: { label: 'DI', className: 'bg-[var(--badge-di)]/15 text-[var(--badge-di)] border-[var(--badge-di)]/30' },
  wireless: { label: 'WL', className: 'bg-[var(--badge-wireless)]/15 text-[var(--badge-wireless)] border-[var(--badge-wireless)]/30' },
  line: { label: 'LINE', className: 'bg-[var(--badge-line)]/15 text-[var(--badge-line)] border-[var(--badge-line)]/30' },
  comms: { label: 'COMMS', className: 'bg-[var(--badge-comms)]/15 text-[var(--badge-comms)] border-[var(--badge-comms)]/30' },
}

const mixTypeConfig: Record<MixType, { label: string; className: string }> = {
  wedge: { label: 'Wedge', className: 'bg-[var(--badge-wedge)]/15 text-[var(--badge-wedge)] border-[var(--badge-wedge)]/30' },
  iem: { label: 'IEM', className: 'bg-[var(--badge-iem)]/15 text-[var(--badge-iem)] border-[var(--badge-iem)]/30' },
  fx: { label: 'FX', className: 'bg-[var(--badge-fx)]/15 text-[var(--badge-fx)] border-[var(--badge-fx)]/30' },
  matrix: { label: 'Matrix', className: 'bg-[var(--badge-matrix)]/15 text-[var(--badge-matrix)] border-[var(--badge-matrix)]/30' },
}

export function InputTypeBadge({ type }: { type: InputType | null }) {
  if (!type) return null
  const config = inputTypeConfig[type]
  if (!config) return null

  return (
    <span className={cn('badge inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border', config.className)}>
      {config.label}
    </span>
  )
}

export function MixTypeBadge({ type }: { type: MixType | null }) {
  if (!type) return null
  const config = mixTypeConfig[type]
  if (!config) return null

  return (
    <span className={cn('badge inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border', config.className)}>
      {config.label}
    </span>
  )
}

export function PhantomBadge() {
  return (
    <span className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium text-[var(--phantom)] bg-[var(--phantom)]/10 border border-[var(--phantom)]/30">
      48V
    </span>
  )
}

export function ChangedBadge() {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--changed)] bg-[var(--changed-bg)] border border-[var(--changed)]/30">
      CHANGED
    </span>
  )
}
