import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmmprqvtcopqmdkbqbdr.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbXBycXZ0Y29wcW1ka2JxYmRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg0OTM5OCwiZXhwIjoyMDk3NDI1Mzk4fQ.i6CkFnGSy2pvyWH7avPbEikI5RGGDZj0Gkkg9a1-tIo'

const supabase = createClient(supabaseUrl, serviceKey)

async function testAdminCreate() {
  console.log('Attempting admin user creation to capture trigger error...')
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin_test_' + Date.now() + '@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Admin Test' }
  })
  
  if (error) {
    console.error('EXACT DATABASE ERROR:')
    console.error(JSON.stringify(error, null, 2))
  } else {
    console.log('SUCCESS! User created:', data.user.id)
    // Clean up
    await supabase.auth.admin.deleteUser(data.user.id)
  }
}

testAdminCreate()
