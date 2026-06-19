import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bmmprqvtcopqmdkbqbdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbXBycXZ0Y29wcW1ka2JxYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NDkzOTgsImV4cCI6MjA5NzQyNTM5OH0.UeKs6ucnM7bKctLijs-Cjdy3Cz0dGYOWiMSzwUmG4Pk'
)

async function test() {
  console.log('Attempting signup...')
  const { data, error } = await supabase.auth.signUp({
    email: 'testagent' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: { full_name: 'Test Agent' }
    }
  })
  
  if (error) {
    console.error('ERROR OBJECT:', error)
    console.error('ERROR MESSAGE:', error.message)
    console.error('ERROR NAME:', error.name)
  } else {
    console.log('SUCCESS:', data)
  }
}

test()
