import axios from 'axios'
import { supabase } from '@/lib/supabase/client'

const BASE_URL = 'https://api.commerce7.com/v1'
const API_LIMIT = 50
const API_DELAY_MS = 2000
const MAX_PAGES = 100
const MAX_RETRIES = 3

// Guest Product Identifiers
const GUEST_PRODUCT_IDS: Record<string, string> = {
  'fe778da9-5164-4688-acd2-98d044d7ce84': 'Non-Club Guest',
  '75d4f6cf-cf69-4e76-8f3b-bb35cc7ddeb3': 'Club Member',
  '718b9fbb-4e23-48c7-8b2d-da86d2624b36': 'Trade Guest',
}

// Department & Type Identifiers
const WINE_BOTTLE_DEPARTMENT_ID = '7f3a16cc-62b3-4625-b995-e4a3af41e441'
const TASTING_DEPARTMENT_ID = '8571508b-bcfe-4d96-b12d-0a2b941bc3f1'
const DINING_DEPARTMENT_ID = '3b4ae488-af0a-4f72-955e-571dfabea081'
const WINE_BY_THE_GLASS_DEPARTMENT_ID = 'b95fae3f-7671-47ea-82f6-617a7ce4b826'

interface SyncProgress {
  total: number
  processed: number
  status: 'running' | 'completed' | 'error'
  message?: string
}

export class Commerce7SyncService {
  private headers: any
  private progress: SyncProgress = {
    total: 0,
    processed: 0,
    status: 'running'
  }

  constructor() {
    const authString = `${process.env.C7_APP_ID}:${process.env.C7_API_KEY}`
    const encoded = Buffer.from(authString).toString('base64')
    
    this.headers = {
      'Authorization': `Basic ${encoded}`,
      'tenant': process.env.C7_TENANT_ID,
      'Content-Type': 'application/json',
    }
  }

  async syncHistoricalData(startDate: Date, endDate: Date) {
    console.log('[SYNC] Starting historical sync:', startDate, endDate)
    const syncLog = await this.createSyncLog('historical_sync')
    
    try {
      // Fetch orders
      const allOrders = await this.syncOrders(startDate, endDate)
      console.log(`[SYNC] Orders fetched: ${allOrders.length}`)
      
      // Extract and upsert staff
      await this.syncStaffFromOrders(allOrders)
      
      // Fetch club memberships
      await this.syncClubMemberships(startDate, endDate)
      
      // Calculate daily KPIs
      await this.calculateDailyKPIs(startDate, endDate)
      
      await this.completeSyncLog(syncLog.id, 'completed')
      console.log('[SYNC] Historical sync completed.')
    } catch (error: any) {
      console.error('[SYNC] Error during historical sync:', error)
      await this.completeSyncLog(syncLog.id, 'error', error.message)
      throw error
    }
  }

  private async syncOrders(startDate: Date, endDate: Date) {
    console.log('[SYNC] Fetching orders...')
    let page = 1
    let hasMore = true
    const allOrders: any[] = []
    const orderPaidDate = `btw:${startDate.toISOString().split('T')[0]}|${endDate.toISOString().split('T')[0]}`

    while (hasMore && page <= MAX_PAGES) {
      let currentTry = 1
      let success = false
      let orders: any[] = []
      while (currentTry <= MAX_RETRIES && !success) {
        try {
          const response = await axios.get(`${BASE_URL}/order`, {
            headers: this.headers,
            params: {
              page,
              limit: API_LIMIT,
              orderPaidDate
            }
          })
          // Dynamically find the array property
          const propertyName = Object.keys(response.data).find(k => Array.isArray(response.data[k]))
          orders = propertyName ? response.data[propertyName] : []
          if (orders.length > 0) {
            for (const order of orders) {
              await this.storeOrder(order)
            }
            this.progress.processed += orders.length
            allOrders.push(...orders)
          }
          console.log(`[SYNC] Page ${page}: fetched ${orders.length} orders.`)
          success = true
          if (orders.length < API_LIMIT) {
            hasMore = false
          } else {
            await new Promise(resolve => setTimeout(resolve, API_DELAY_MS))
          }
        } catch (error) {
          console.error(`[SYNC] Error fetching orders page ${page}:`, error)
          currentTry++
          if (currentTry > MAX_RETRIES) {
            hasMore = false
            break
          }
          await new Promise(resolve => setTimeout(resolve, currentTry * API_DELAY_MS))
        }
      }
      page++
    }
    return allOrders
  }

  private async storeOrder(orderData: any) {
    // Calculate guest breakdown
    const guestBreakdown: Record<string, number> = {}
    let guestCount = 0
    let bottleCount = 0
    let hasWineBottles = false
    let isTastingOrder = false
    let hasDiningItem = false
    let hasWineByTheGlassItem = false

    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        // Guest count by type
        if (GUEST_PRODUCT_IDS[item.productId]) {
          const guestType = GUEST_PRODUCT_IDS[item.productId]
          guestBreakdown[guestType] = (guestBreakdown[guestType] || 0) + item.quantity
          guestCount += item.quantity
        }
        // Wine bottle count
        if (item.departmentId === WINE_BOTTLE_DEPARTMENT_ID) {
          hasWineBottles = true
          bottleCount += item.quantity
        }
        // Service type flags
        if (item.departmentId === TASTING_DEPARTMENT_ID) {
          isTastingOrder = true
        }
        if (item.departmentId === DINING_DEPARTMENT_ID) {
          hasDiningItem = true
        }
        if (item.departmentId === WINE_BY_THE_GLASS_DEPARTMENT_ID) {
          hasWineByTheGlassItem = true
        }
      }
    }

    // Determine service type
    let serviceType = 'retail'
    if (isTastingOrder) {
      serviceType = 'tasting'
    } else if (hasDiningItem) {
      serviceType = 'dining'
    } else if (hasWineByTheGlassItem) {
      serviceType = 'byTheGlass'
    }

    // Transform order data
    const order = {
      id: orderData.id,
      order_date: orderData.orderPaidDate || orderData.createdAt,
      customer_id: orderData.customerId,
      associate_name: orderData.salesAssociate?.name || 'Unknown',
      total: orderData.total / 100,
      subtotal: orderData.subTotal / 100,
      tax: orderData.taxTotal / 100,
      tip: (orderData.tip || 0) / 100,
      guest_count: guestCount,
      bottle_count: bottleCount,
      has_wine_bottles: hasWineBottles,
      service_type: serviceType,
      guest_breakdown: guestBreakdown,
      raw_data: orderData
    }
    await supabase.from('orders').upsert(order)
  }

  async syncStaffFromOrders(orders: any[]) {
    console.log('[SYNC] Extracting staff from orders...')
    const seen = new Set<string>()
    const staffToUpsert: any[] = []
    for (const order of orders) {
      const name = order.salesAssociate?.name?.trim()
      if (name && !seen.has(name)) {
        seen.add(name)
        staffToUpsert.push({
          name,
          email: order.salesAssociate?.email || null,
          phone: order.salesAssociate?.phone || null,
          role: 'associate',
          is_active: true
        })
      }
    }
    console.log(`[SYNC] Staff extracted: ${staffToUpsert.length}`)
    if (staffToUpsert.length > 0) {
      const { error } = await supabase.from('staff_members').upsert(staffToUpsert)
      if (error) {
        console.error('[SYNC] Error upserting staff:', error)
      } else {
        console.log('[SYNC] Staff upserted successfully.')
      }
    } else {
      console.log('[SYNC] No staff to upsert.')
    }
  }

  // Helper methods (no longer needed as stubs)

  private async createSyncLog(syncType: string) {
    const { data } = await supabase
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date()
      })
      .select()
      .single()
    return data
  }

  private async completeSyncLog(id: string, status: string, errorMessage?: string) {
    await supabase
      .from('sync_logs')
      .update({
        status,
        completed_at: new Date(),
        records_processed: this.progress.processed,
        error_message: errorMessage
      })
      .eq('id', id)
  }

  async syncClubMemberships(startDate: Date, endDate: Date) {
    console.log('[SYNC] Fetching club memberships...')
    // Placeholder for club membership sync logic
  }

  private async calculateDailyKPIs(startDate: Date, endDate: Date) {
    console.log('[SYNC] Calculating daily KPIs (Node.js logic port)...')
    // Fetch all orders in the date range
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date', startDate.toISOString())
      .lte('order_date', endDate.toISOString())
    if (!orders || orders.length === 0) {
      console.log('[SYNC] No orders found for KPI calculation.')
      return
    }
    // Fetch all club signups in the date range
    const { data: clubSignups } = await supabase
      .from('club_signups')
      .select('*')
      .gte('signup_date', startDate.toISOString().slice(0, 10))
      .lte('signup_date', endDate.toISOString().slice(0, 10))
    // Group orders by date (YYYY-MM-DD)
    const ordersByDate: Record<string, any[]> = {}
    for (const order of orders) {
      const date = (order.order_date || '').slice(0, 10)
      if (!ordersByDate[date]) ordersByDate[date] = []
      ordersByDate[date].push(order)
    }
    for (const [date, dayOrders] of Object.entries(ordersByDate)) {
      // Filter out $0 revenue orders for KPI calculations
      const revenueOrders = dayOrders.filter(order => (order.subtotal || 0) + (order.tax || 0) > 0)
      // Club signups for this day
      const dayClubSignups = (clubSignups || []).filter(cs => cs.signup_date === date)
      const clubSignupCustomers = new Set(dayClubSignups.map(cs => cs.customer_id))
      // Overall metrics
      let totalRevenue = 0, totalOrders = 0, totalGuests = 0, totalBottlesSold = 0, subTotal = 0, taxTotal = 0, tipTotal = 0, grandTotal = 0
      let totalNonClubAndTradeGuests = 0, totalCustomersWhoSignedUpForClub = 0, totalGuestsWhoBoughtWineBottles = 0
      const guestBreakdown: Record<string, number> = {}
      const associatePerformance: Record<string, any> = {}
      const serviceTypeAnalysis: Record<string, any> = {
        tasting: { orders: 0, guests: 0, bottles: 0, revenue: 0, guestsWhoBoughtBottles: 0, guestsWhoSignedUpForClub: 0, nonClubGuests: 0 },
        dining: { orders: 0, guests: 0, bottles: 0, revenue: 0, guestsWhoBoughtBottles: 0, guestsWhoSignedUpForClub: 0, nonClubGuests: 0 },
        byTheGlass: { orders: 0, guests: 0, bottles: 0, revenue: 0, guestsWhoBoughtBottles: 0, guestsWhoSignedUpForClub: 0, nonClubGuests: 0 },
        retail: { orders: 0, guests: 0, bottles: 0, revenue: 0, guestsWhoBoughtBottles: 0, guestsWhoSignedUpForClub: 0, nonClubGuests: 0 },
      }
      const customerClubSignupAttribution = new Map()
      let guestOnlyOrders = 0, wineOrders = 0, mixedOrders = 0
      for (const order of revenueOrders) {
        totalOrders++
        const orderRevenue = (order.subtotal || 0) + (order.tax || 0)
        totalRevenue += orderRevenue
        subTotal += order.subtotal || 0
        taxTotal += order.tax || 0
        tipTotal += order.tip || 0
        grandTotal += order.total || 0
        const associateName = order.associate_name || 'Unknown'
        if (!associatePerformance[associateName]) associatePerformance[associateName] = { orders: 0, guests: 0, revenue: 0, bottles: 0, wineBottleSales: 0, clubSignups: 0, wineBottleConversionRate: 0, clubConversionRate: 0, nonClubGuests: 0 }
        associatePerformance[associateName].orders++
        associatePerformance[associateName].revenue += orderRevenue
        let orderGuestCount = 0, orderNonClubAndTradeGuestCount = 0, orderBottleCount = 0
        let hasGuestItems = false, hasWineBottleItems = false
        let isTastingOrder = false, hasDiningItem = false, hasWineByTheGlassItem = false
        if (order.raw_data && Array.isArray(order.raw_data.items)) {
          for (const item of order.raw_data.items) {
            // Guest count by type
            if (item.productId && GUEST_PRODUCT_IDS[item.productId]) {
              const guestType = GUEST_PRODUCT_IDS[item.productId]
              guestBreakdown[guestType] = (guestBreakdown[guestType] || 0) + item.quantity
              orderGuestCount += item.quantity
              hasGuestItems = true
              if (guestType === 'Non-Club Guest' || guestType === 'Trade Guest') {
                orderNonClubAndTradeGuestCount += item.quantity
              }
            }
            if (item.departmentId === TASTING_DEPARTMENT_ID) isTastingOrder = true
            if (item.departmentId === DINING_DEPARTMENT_ID) hasDiningItem = true
            if (item.departmentId === WINE_BY_THE_GLASS_DEPARTMENT_ID) hasWineByTheGlassItem = true
            if (item.departmentId === WINE_BOTTLE_DEPARTMENT_ID) {
              hasWineBottleItems = true
              orderBottleCount += item.quantity
            }
          }
        }
        // Service type
        let serviceType = 'retail'
        if (isTastingOrder) serviceType = 'tasting'
        else if (hasDiningItem) serviceType = 'dining'
        else if (hasWineByTheGlassItem) serviceType = 'byTheGlass'
        const serviceMetrics = serviceTypeAnalysis[serviceType]
        serviceMetrics.orders++
        serviceMetrics.guests += orderGuestCount
        serviceMetrics.bottles += orderBottleCount
        serviceMetrics.revenue += orderRevenue
        serviceMetrics.nonClubGuests += orderNonClubAndTradeGuestCount
        if (hasWineBottleItems && orderGuestCount > 0) serviceMetrics.guestsWhoBoughtBottles += orderGuestCount
        // Club signup attribution
        const customerSignedUpForClub = clubSignupCustomers.has(order.customer_id)
        if (customerSignedUpForClub) {
          if (!customerClubSignupAttribution.has(order.customer_id)) {
            customerClubSignupAttribution.set(order.customer_id, associateName)
            associatePerformance[associateName].clubSignups++
            totalCustomersWhoSignedUpForClub++
            serviceMetrics.guestsWhoSignedUpForClub++
          }
        }
        if (orderGuestCount > 0) {
          totalGuests += orderGuestCount
          totalNonClubAndTradeGuests += orderNonClubAndTradeGuestCount
          associatePerformance[associateName].guests += orderGuestCount
          associatePerformance[associateName].nonClubGuests += orderNonClubAndTradeGuestCount
          if (hasWineBottleItems) associatePerformance[associateName].wineBottleSales += orderGuestCount
        }
        totalBottlesSold += orderBottleCount
        associatePerformance[associateName].bottles += orderBottleCount
        if (hasGuestItems && !hasWineBottleItems) guestOnlyOrders++
        else if (!hasGuestItems && hasWineBottleItems) wineOrders++
        else if (hasGuestItems && hasWineBottleItems) mixedOrders++
      }
      // Final calculations
      totalGuestsWhoBoughtWineBottles = Object.values(serviceTypeAnalysis).reduce((acc, m: any) => acc + m.guestsWhoBoughtBottles, 0)
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const avgGuestsPerOrder = totalOrders > 0 ? totalGuests / totalOrders : 0
      const totalGuestExperiences = guestOnlyOrders + mixedOrders
      const conversionRate = totalGuestExperiences > 0 ? (mixedOrders / totalGuestExperiences) * 100 : 0
      const wineBottleConversionRate = totalGuests > 0 ? (totalGuestsWhoBoughtWineBottles / totalGuests) * 100 : 0
      const clubConversionRate = totalNonClubAndTradeGuests > 0 ? (totalCustomersWhoSignedUpForClub / totalNonClubAndTradeGuests) * 100 : 0
      // Service type breakdown: add bottle/club conversion and AOV
      for (const type in serviceTypeAnalysis) {
        const m = serviceTypeAnalysis[type]
        m.bottleConversionRate = m.guests > 0 ? (m.guestsWhoBoughtBottles / m.guests) * 100 : 0
        m.clubConversionRate = m.nonClubGuests > 0 ? (m.guestsWhoSignedUpForClub / m.nonClubGuests) * 100 : 0
        m.aov = m.orders > 0 ? m.revenue / m.orders : 0
        m.revenue = Number((m.revenue / 100).toFixed(2))
        m.aov = Number((m.aov / 100).toFixed(2))
      }
      // Associate performance: add conversion rates
      for (const name in associatePerformance) {
        const a = associatePerformance[name]
        a.wineBottleConversionRate = a.guests > 0 ? (a.wineBottleSales / a.guests) * 100 : 0
        a.clubConversionRate = a.nonClubGuests > 0 ? (a.clubSignups / a.nonClubGuests) * 100 : 'n/a'
        a.revenue = Number((a.revenue / 100).toFixed(2))
      }
      // Upsert into kpi_daily_snapshots
      await supabase.from('kpi_daily_snapshots').upsert({
        date,
        total_revenue: Number((totalRevenue / 100).toFixed(2)),
        total_orders: totalOrders,
        total_guests: totalGuests,
        total_bottles_sold: totalBottlesSold,
        avg_order_value: Number((avgOrderValue / 100).toFixed(2)),
        wine_bottle_conversion_rate: Number(wineBottleConversionRate.toFixed(2)),
        club_conversion_rate: Number(clubConversionRate.toFixed(2)),
        service_type_breakdown: serviceTypeAnalysis,
        associate_performance: associatePerformance,
        guest_breakdown: guestBreakdown,
        created_at: new Date()
      }, { onConflict: 'date' })
      console.log(`[SYNC] KPI snapshot upserted for ${date}`)
    }
    console.log('[SYNC] Daily KPI calculation complete.')
  }
} 