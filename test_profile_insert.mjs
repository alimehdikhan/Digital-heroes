import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = 'https://bmmprqvtcopqmdkbqbdr.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbXBycXZ0Y29wcW1ka2JxYmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg0OTM5OCwiZXhwIjoyMDk3NDI1Mzk4fQ.i6CkFnGSy2pvyWH7avPbEikI5RGGDZj0Gkkg9a1-tIo'

const supabase = createClient(supabaseUrl, serviceKey)

async function testProfileInsert() {
  console.log('Testing direct insert into profiles table...')
  
  // Create a fake UUID since profiles references auth.users
  // Wait, if it references auth.users, we MUST insert into auth.users first, or disable the constraint.
  // We can't insert into auth.users directly via REST API, only via Auth API.
  // Let's check if the table has the foreign key.
  
  const fakeId = uuidv4()
  const { error } = await supabase.from('profiles').insert({
    id: fakeId,
    name: 'Direct Insert Test'
  })
  
  if (error) {
    console.error('Direct insert error:', error.message, error.details, error.hint)
  } else {
    console.log('Direct insert successful!')
  }
}

testProfileInsert()
