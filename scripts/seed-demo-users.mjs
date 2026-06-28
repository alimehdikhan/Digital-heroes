/**
 * Seeds PRD demo accounts for evaluator testing.
 *
 * Usage (from project root):
 *   npm run seed:demo
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(root, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_ACCOUNTS = [
  {
    email: 'hero@digitalheroes.test',
    password: 'Hero1234!',
    name: 'Demo Hero',
    role: 'user',
    subscription_status: 'active',
    subscription_plan: 'monthly',
    charity_percentage: 15,
    seedScores: [32, 28, 36, 30, 34],
  },
  {
    email: 'admin@digitalheroes.test',
    password: 'Admin1234!',
    name: 'Demo Admin',
    role: 'admin',
    subscription_status: 'active',
    subscription_plan: 'yearly',
    charity_percentage: 10,
    seedScores: [],
  },
]

async function ensureCharity() {
  const { data: existing } = await supabase
    .from('charities')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from('charities')
    .insert({
      name: 'Golf Foundation',
      description: 'Introducing more people to golf and community impact.',
      is_active: true,
      total_contributed: 0,
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

async function upsertDemoUser(account, charityId) {
  const { data: list } = await supabase.auth.admin.listUsers()
  const existing = list?.users?.find((u) => u.email === account.email)

  let userId = existing?.id

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        supported_charity_id: charityId,
        charity_percentage: account.charity_percentage,
      },
    })
    if (error) throw error
    userId = data.user.id
    console.log(`Created auth user: ${account.email}`)
  } else {
    await supabase.auth.admin.updateUserById(userId, {
      password: account.password,
      user_metadata: {
        name: account.name,
        supported_charity_id: charityId,
        charity_percentage: account.charity_percentage,
      },
    })
    console.log(`Updated auth user: ${account.email}`)
  }

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  const baseProfile = {
    id: userId,
    name: account.name,
    role: account.role,
    subscription_status: account.subscription_status,
    subscription_plan: account.subscription_plan,
    subscription_expires_at: expiresAt.toISOString(),
    supported_charity_id: charityId,
  }

  const { error: profileError } = await supabase.from('profiles').upsert(baseProfile)
  if (profileError) throw profileError

  const { error: pctError } = await supabase
    .from('profiles')
    .update({ charity_percentage: account.charity_percentage })
    .eq('id', userId)

  if (pctError) {
    console.warn(`  Note: charity_percentage not set for ${account.email} — run migration 015 if needed`)
  }

  if (account.seedScores.length > 0) {
    await supabase.from('scores').delete().eq('user_id', userId)

    const today = new Date()
    const rows = account.seedScores.map((score, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - index * 7)
      return {
        user_id: userId,
        score,
        date: date.toISOString().slice(0, 10),
      }
    })

    const { error: scoresError } = await supabase.from('scores').insert(rows)
    if (scoresError) throw scoresError
    console.log(`Seeded ${rows.length} scores for ${account.email}`)
  }
}

async function main() {
  console.log('Seeding PRD demo accounts...\n')
  const charityId = await ensureCharity()

  for (const account of DEMO_ACCOUNTS) {
    await upsertDemoUser(account, charityId)
  }

  console.log('\nDemo credentials (PRD deliverables):')
  console.log('-----------------------------------')
  console.log('Subscriber: hero@digitalheroes.test / Hero1234!')
  console.log('Admin:      admin@digitalheroes.test / Admin1234!')
  console.log('\nLogin at /login — admin panel at /admin')
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})