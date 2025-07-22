import { useState } from 'react'

const presets = [
  { label: 'Today', range: () => {
    const today = new Date();
    return { start: today, end: today }
  }},
  { label: 'Week', range: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end }
  }},
  { label: 'Month', range: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return { start, end }
  }},
  { label: 'Quarter', range: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 89);
    return { start, end }
  }},
  { label: 'Year', range: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 364);
    return { start, end }
  }},
]

export function DateRangePicker({ value, onChange }: { value: { start: Date, end: Date }, onChange: (range: { start: Date, end: Date }) => void }) {
  const [customStart, setCustomStart] = useState(value.start.toISOString().slice(0, 10))
  const [customEnd, setCustomEnd] = useState(value.end.toISOString().slice(0, 10))

  function handlePreset(rangeFn: () => { start: Date, end: Date }) {
    const range = rangeFn()
    onChange(range)
    setCustomStart(range.start.toISOString().slice(0, 10))
    setCustomEnd(range.end.toISOString().slice(0, 10))
  }

  function handleCustomChange(start: string, end: string) {
    const s = new Date(start)
    const e = new Date(end)
    onChange({ start: s, end: e })
    setCustomStart(start)
    setCustomEnd(end)
  }

  return (
    <div className="flex items-center gap-2">
      {presets.map(p => (
        <button
          key={p.label}
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          onClick={() => handlePreset(p.range)}
        >
          {p.label}
        </button>
      ))}
      <input
        type="date"
        value={customStart}
        onChange={e => handleCustomChange(e.target.value, customEnd)}
        className="border rounded px-2 py-1 text-sm"
      />
      <span className="mx-1">-</span>
      <input
        type="date"
        value={customEnd}
        onChange={e => handleCustomChange(customStart, e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  )
} 