import { NextRequest, NextResponse } from 'next/server'
import { AIInsightsService } from '@/lib/ai/insights'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    if (!name || !start || !end) {
      return NextResponse.json({ error: 'Missing required query parameters: name, start, end' }, { status: 400 })
    }
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
    }
    const ai = new AIInsightsService()
    const insights = await ai.analyzeStaffPerformance(name, { start: startDate, end: endDate })
    return NextResponse.json({ insights })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 