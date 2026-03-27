import type { InputType, MixType } from '@/lib/types'

const inputTypeConfig: Record<InputType, { label: string; color: string }> = {
  xlr_mic: { label: 'XLR', color: 'var(--badge-xlr)' },
  di: { label: 'DI', color: 'var(--badge-di)' },
  wireless: { label: 'WL', color: 'var(--badge-wireless)' },
  line: { label: 'LINE', color: 'var(--badge-line)' },
  comms: { label: 'COMMS', color: 'var(--badge-comms)' },
}

const mixTypeConfig: Record<MixType, { label: string; color: string }> = {
  wedge: { label: 'Wedge', color: 'var(--badge-wedge)' },
  iem: { label: 'IEM', color: 'var(--badge-iem)' },
  fx: { label: 'FX', color: 'var(--badge-fx)' },
  matrix: { label: 'Matrix', color: 'var(--badge-matrix)' },
}

export function InputTypeBadge({ type }: { type: InputType | null }) {
  if (!type) return null
  const config = inputTypeConfig[type]
  if (!config) return null

  return (
    <span
      className="badge inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide border"
      style={{
        color: config.color,
        borderColor: `color-mix(in srgb, ${config.color} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
      }}
    >
      {config.label}
    </span>
  )
}

export function MixTypeBadge({ type }: { type: MixType | null }) {
  if (!type) return null
  const config = mixTypeConfig[type]
  if (!config) return null

  return (
    <span
      className="badge inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide border"
      style={{
        color: config.color,
        borderColor: `color-mix(in srgb, ${config.color} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
      }}
    >
      {config.label}
    </span>
  )
}

export function PhantomBadge() {
  return (
    <span className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold tracking-wider text-red-500 bg-red-500/10">
      48V
    </span>
  )
}

export function ChangedBadge() {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
      style={{
        color: 'var(--changed)',
        backgroundColor: 'var(--changed-bg)',
      }}
    >
      Changed
    </span>
  )
}
