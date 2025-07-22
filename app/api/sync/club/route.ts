import { NextResponse } from 'next/server'
import { Commerce7SyncService } from '@/lib/commerce7/sync'

export async function POST() {
  try {
    const sync = new Commerce7SyncService()
    // Use a wide date range for full club sync
    const startDate = new Date('2022-04-01')
    const endDate = new Date('2025-07-21')
    await sync.syncClubMemberships(startDate, endDate)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 