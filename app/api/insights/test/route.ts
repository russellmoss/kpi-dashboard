import { NextResponse } from 'next/server'
import { AIInsightsService } from '@/lib/ai/insights'

export async function GET() {
  try {
    const ai = new AIInsightsService()
    const insights = await ai.generateDailyInsights(new Date())
    return NextResponse.json({ insights })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 