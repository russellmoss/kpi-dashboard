import { useEffect, useState } from 'react'

export function AIInsightsPanel({ date }: { date: Date }) {
  const [insights, setInsights] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setInsights('')
    fetch(`/api/insights?date=${date.toISOString().slice(0, 10)}`)
      .then(res => res.json())
      .then(data => {
        if (data.insights) setInsights(data.insights)
        else setError(data.error || 'No insights returned')
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [date])

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg p-8 min-h-[160px] flex flex-col mt-8 border border-yellow-100">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">🤖</span>
        <h2 className="text-xl font-bold text-yellow-900 tracking-tight">AI Insights</h2>
      </div>
      {loading && <span className="text-gray-400 italic">Generating insights for your team...</span>}
      {error && <span className="text-red-500 font-medium">{error}</span>}
      {!loading && !error && (
        <div className="whitespace-pre-line text-gray-800 leading-relaxed text-base">
          {insights}
        </div>
      )}
    </div>
  )
} 