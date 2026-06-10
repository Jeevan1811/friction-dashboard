import { createClient } from '@supabase/supabase-js'

// Project: fziaxuhonvrhqjulhcyu — ACTIVE_HEALTHY
// Region: ap-southeast-2 (Sydney)
// RLS: enabled on all friction_ tables with open anon policy (upgrade to auth later)
const SUPABASE_URL  = 'https://fziaxuhonvrhqjulhcyu.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aWF4dWhvbnZyaHFqdWxoY3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjQ2MzYsImV4cCI6MjA5NTM0MDYzNn0.QIYeXomnXXGKvkP-dkjwqe3mnDYTdN9zgcvlYlhM2Xk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  realtime: { params: { eventsPerSecond: 10 } },
})
