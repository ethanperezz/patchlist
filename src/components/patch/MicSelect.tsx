'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { searchMics, MIC_OPTIONS } from '@/lib/mic-database'

interface MicSelectProps {
  value: string | null
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  compact?: boolean // For inline editing in channel rows
}

export function MicSelect({ value, onChange, className, placeholder = 'Select mic...', compact }: MicSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = searchMics(query)

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-mic-select]')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const items = listRef.current.querySelectorAll('[data-mic-item]')
    items[highlighted]?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  function handleSelect(mic: string) {
    onChange(mic)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlighted]) {
        handleSelect(results[highlighted])
      } else if (query.trim()) {
        // Allow custom mic not in the list
        handleSelect(query.trim())
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    } else if (e.key === 'Tab') {
      setOpen(false)
      if (query.trim() && results.length > 0) {
        handleSelect(results[highlighted] || query.trim())
      }
    }
  }

  return (
    <div className="relative" data-mic-select>
      <input
        ref={inputRef}
        type="text"
        value={open ? query : (value || '')}
        onChange={e => {
          setQuery(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setQuery(value || '')
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full rounded border border-input bg-transparent text-xs outline-none transition-colors',
          'focus:border-ring focus:ring-1 focus:ring-ring/20',
          compact ? 'h-6 px-1' : 'h-8 px-2',
          className
        )}
      />
      {open && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-48 w-64 overflow-auto rounded-md border bg-popover shadow-md"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              {query ? (
                <div>
                  <p>No mics found for &ldquo;{query}&rdquo;</p>
                  <button
                    className="mt-2 text-foreground underline underline-offset-2 cursor-pointer"
                    onClick={() => handleSelect(query.trim())}
                  >
                    Use &ldquo;{query.trim()}&rdquo; as custom
                  </button>
                </div>
              ) : (
                <p>Type to search {MIC_OPTIONS.length} microphones</p>
              )}
            </div>
          ) : (
            results.map((mic, i) => (
              <button
                key={mic}
                data-mic-item
                className={cn(
                  'flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors cursor-pointer',
                  i === highlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                  mic === value && 'font-medium'
                )}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => handleSelect(mic)}
              >
                {mic}
                {mic === value && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 text-foreground"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
