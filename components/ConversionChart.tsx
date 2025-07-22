import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function ConversionChart({ data }: { data: any[] }) {
  // Prepare data: expects array of { date, wine_bottle_conversion_rate }
  const chartData = (data || []).map((d: any) => ({
    date: d.date,
    conversion: d.wine_bottle_conversion_rate || 0
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Wine Bottle Conversion Rate</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} labelFormatter={l => `Date: ${l}`} />
          <Line type="monotone" dataKey="conversion" stroke="#a16207" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 