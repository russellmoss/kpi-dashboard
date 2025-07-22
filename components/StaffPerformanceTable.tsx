import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface StaffPerformance {
  name: string
  orders: number
  guests: number
  bottles: number
  revenue: number
  wineBottleConversionRate: number
}

export function StaffPerformanceTable({ dateRange }: { dateRange: { start: Date, end: Date } }) {
  const [data, setData] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [dateRange])

  async function fetchData() {
    setLoading(true)
    // Fetch all staff
    const { data: staff } = await supabase
      .from('staff_members')
      .select('id, name')
      .order('name')
    if (!staff) {
      setData([])
      setLoading(false)
      return
    }
    // Fetch all orders in range
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date', dateRange.start.toISOString())
      .lte('order_date', dateRange.end.toISOString())
    // Aggregate by staff
    const perf: StaffPerformance[] = staff.map((s: any) => {
      const staffOrders = (orders || []).filter((o: any) => o.associate_name === s.name)
      const guests = staffOrders.reduce((sum, o) => sum + (o.guest_count || 0), 0)
      const bottles = staffOrders.reduce((sum, o) => sum + (o.bottle_count || 0), 0)
      const revenue = staffOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      const wineOrders = staffOrders.filter((o: any) => o.has_wine_bottles && o.guest_count > 0)
      const wineBottleConversionRate = guests > 0 ? (wineOrders.length / guests) * 100 : 0
      return {
        name: s.name,
        orders: staffOrders.length,
        guests,
        bottles,
        revenue,
        wineBottleConversionRate: Number(wineBottleConversionRate.toFixed(1)),
      }
    })
    setData(perf)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-right">Orders</th>
              <th className="px-3 py-2 text-right">Guests</th>
              <th className="px-3 py-2 text-right">Bottles</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2 text-right">Wine Conv. %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.name} className="border-b last:border-0 hover:bg-yellow-50">
                <td className="px-3 py-2 font-medium text-gray-900">{s.name}</td>
                <td className="px-3 py-2 text-right">{s.orders}</td>
                <td className="px-3 py-2 text-right">{s.guests}</td>
                <td className="px-3 py-2 text-right">{s.bottles}</td>
                <td className="px-3 py-2 text-right">${s.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-3 py-2 text-right">{s.wineBottleConversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
} 