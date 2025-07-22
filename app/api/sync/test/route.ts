import { NextResponse } from 'next/server'
import { Commerce7SyncService } from '@/lib/commerce7/sync'

export async function GET() {
  try {
    const sync = new Commerce7SyncService()
    // Test with last 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    await sync.syncHistoricalData(startDate, endDate)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 