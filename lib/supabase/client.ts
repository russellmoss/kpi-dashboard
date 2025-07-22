import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test connection
export async function testConnection() {
  const { data, error } = await supabase
    .from('staff_members')
    .select('count')

  if (error) {
    console.error('Database connection failed:', error)
    return false
  }

  console.log('Database connected successfully')
  return true
} 