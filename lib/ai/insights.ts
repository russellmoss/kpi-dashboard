import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase/client'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export class AIInsightsService {
  async generateDailyInsights(date: Date) {
    // Fetch KPI data
    const { data: kpiData } = await supabase
      .from('kpi_daily_snapshots')
      .select('*')
      .eq('date', date.toISOString().split('T')[0])
      .single()
    
    // Fetch historical data for comparison
    const { data: historicalData } = await supabase
      .from('kpi_daily_snapshots')
      .select('*')
      .gte('date', new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    const prompt = `
      Analyze the following winery KPI data and provide actionable insights:
      
      Today's KPIs (${date.toLocaleDateString()}):
      ${JSON.stringify(kpiData, null, 2)}
      
      Last 30 days trend:
      ${JSON.stringify(historicalData, null, 2)}
      
      Please provide:
      1. Key performance highlights
      2. Areas of concern
      3. Specific recommendations for improvement
      4. Praise for top performers
      5. Suggested focus areas for tomorrow
      
      Format the response in a friendly, encouraging tone suitable for a winery team.
    `
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    return response.content[0].text
  }

  async analyzeStaffPerformance(staffName: string, dateRange: { start: Date, end: Date }) {
    // Fetch staff-specific data
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('associate_name', staffName)
      .gte('order_date', dateRange.start.toISOString())
      .lte('order_date', dateRange.end.toISOString())
    
    // Calculate staff metrics
    const metrics = this.calculateStaffMetrics(orders)
    
    const prompt = `
      Analyze the performance of ${staffName} and provide personalized coaching:
      
      Performance Metrics:
      ${JSON.stringify(metrics, null, 2)}
      
      Provide:
      1. Strengths to celebrate
      2. Areas for improvement
      3. Specific techniques to improve conversion rates
      4. Motivational message
      
      Keep the tone positive and constructive.
    `
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    return response.content[0].text
  }

  private calculateStaffMetrics(orders: any[]) {
    // Calculate conversion rates, AOV, etc.
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      wineBottleConversionRate: this.calculateWineConversion(orders),
      // ... other metrics
    }
  }

  private calculateWineConversion(orders: any[]): number {
    const ordersWithGuests = orders.filter(o => o.guest_count > 0)
    const ordersWithWine = ordersWithGuests.filter(o => o.has_wine_bottles)
    return ordersWithGuests.length > 0 ? (ordersWithWine.length / ordersWithGuests.length) * 100 : 0
  }
} 