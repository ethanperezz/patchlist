'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface CSVImportProps {
  onImport: (rows: any[]) => void
  disabled?: boolean
}

function parseCSV(text: string): any[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    headers.forEach((h, j) => {
      row[h] = values[j] || ''
    })
    rows.push(row)
  }

  return rows
}

export function CSVImport({ onImport, disabled }: CSVImportProps) {
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length === 0) {
          setError('No data rows found. Ensure the CSV has a header row and at least one data row.')
          return
        }
        setRows(parsed)
      } catch {
        setError('Failed to parse CSV file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        CSV columns: channel_number, name, stage_port, input_type, mic_model, phantom_48v, notes
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />

      {rows.length === 0 ? (
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={disabled}>
          Choose CSV file
        </Button>
      ) : (
        <div>
          <div className="mb-3 max-h-64 overflow-auto rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Ch #</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Port</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Mic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs py-1">{row.channel_number || i + 1}</TableCell>
                    <TableCell className="text-xs py-1">{row.name}</TableCell>
                    <TableCell className="text-xs py-1">{row.stage_port}</TableCell>
                    <TableCell className="text-xs py-1">{row.input_type}</TableCell>
                    <TableCell className="text-xs py-1">{row.mic_model}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onImport(rows)} disabled={disabled}>
              {disabled ? 'Importing...' : `Import ${rows.length} channels`}
            </Button>
            <Button variant="ghost" onClick={() => { setRows([]); if (fileRef.current) fileRef.current.value = '' }}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
