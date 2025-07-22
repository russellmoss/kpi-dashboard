import { NextResponse } from 'next/server'
import { Commerce7SyncService } from '@/lib/commerce7/sync'

export async function GET() {
  // Start the sync in the background
  (async () => {
    try {
      const sync = new Commerce7SyncService()
      const startDate = new Date('2022-04-01')
      const endDate = new Date('2025-07-21')
      await sync.syncHistoricalData(startDate, endDate)
    } catch (error) {
      // Optionally log error somewhere
      console.error('Background sync failed:', error)
    }
  })()

  // Respond immediately
  return NextResponse.json({ started: true, message: 'Full historical sync (2022-04-01 to 2025-07-21) started in background.' })
} 