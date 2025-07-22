import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/supabase/client'

export async function GET() {
  const success = await testConnection()
  if (success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 