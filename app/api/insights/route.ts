import { NextRequest, NextResponse } from 'next/server'
import { AIInsightsService } from '@/lib/ai/insights'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    let date: Date
    if (dateStr) {
      date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
      }
    } else {
      date = new Date()
    }
    const ai = new AIInsightsService()
    const insights = await ai.generateDailyInsights(date)
    return NextResponse.json({ insights })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 