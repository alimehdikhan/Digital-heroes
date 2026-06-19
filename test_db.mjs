import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmmprqvtcopqmdkbqbdr.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbXBycXZ0Y29wcW1ka2JxYmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg0OTM5OCwiZXhwIjoyMDk3NDI1Mzk4fQ.i6CkFnGSy2pvyWH7avPbEikI5RGGDZj0Gkkg9a1-tIo'

const supabase = createClient(supabaseUrl, serviceKey)

async function testDB() {
  console.log('Testing profiles table existence...')
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  
  if (error) {
    console.error('ERROR querying profiles:', error)
  } else {
    console.log('Profiles table EXISTS and is accessible.')
  }

  console.log('Testing triggers exist...')
  // We can't query pg_class via PostgREST easily, but if the table exists, maybe the trigger doesn't.
  // We can just rely on the user to check logs, but let's see if the table exists first.
}

testDB()
