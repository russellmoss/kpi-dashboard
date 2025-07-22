'use client'

import { useState, useEffect } from 'react'
import { DateRangePicker } from '@/components/DateRangePicker'
import { KPICard } from '@/components/KPICard'
import { ConversionChart } from '@/components/ConversionChart'
import { StaffPerformanceTable } from '@/components/StaffPerformanceTable'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  })
  const [kpiData, setKpiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKPIData()
  }, [dateRange])

  async function fetchKPIData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('kpi_daily_snapshots')
      .select('*')
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0])
      .order('date', { ascending: true })
    if (data) {
      setKpiData(aggregateKPIData(data))
    }
    setLoading(false)
  }

  function aggregateKPIData(dailyData: any[]) {
    return {
      totalRevenue: dailyData.reduce((sum, d) => sum + (d.total_revenue || 0), 0),
      totalOrders: dailyData.reduce((sum, d) => sum + (d.total_orders || 0), 0),
      totalGuests: dailyData.reduce((sum, d) => sum + (d.total_guests || 0), 0),
      avgConversionRate: dailyData.length > 0 ? dailyData.reduce((sum, d) => sum + (d.wine_bottle_conversion_rate || 0), 0) / dailyData.length : 0,
      dailyTrends: dailyData
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Milea Estate Vineyard - KPI Dashboard
          </h1>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Revenue"
            value={`$${(kpiData?.totalRevenue || 0).toLocaleString()}`}
            trend={12.5}
            icon="💰"
          />
          <KPICard
            title="Total Guests"
            value={(kpiData?.totalGuests || 0).toLocaleString()}
            trend={-3.2}
            icon="👥"
          />
          <KPICard
            title="Wine Conversion"
            value={`${(kpiData?.avgConversionRate || 0).toFixed(1)}%`}
            trend={5.7}
            icon="🍷"
          />
          <KPICard
            title="Avg Order Value"
            value={`$${((kpiData?.totalRevenue || 0) / (kpiData?.totalOrders || 1)).toFixed(2)}`}
            trend={8.3}
            icon="📊"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ConversionChart data={kpiData?.dailyTrends || []} />
          <StaffPerformanceTable dateRange={dateRange} />
        </div>

        {/* AI Insights */}
        <AIInsightsPanel date={dateRange.end} />
      </div>
    </div>
  )
} 