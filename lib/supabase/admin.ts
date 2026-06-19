import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses ALL RLS.
 * ONLY use server-side in Route Handlers and the draw engine.
 * NEVER expose the service role key to the client.
 *
 * Lazily instantiated so the build doesn't fail without env vars.
 * Swap the `any` generic for `Database` from '@/types/database'
 * after running `npm run db:types`.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, 'public', any>

let _instance: AdminClient | null = null

export function getAdminClient(): AdminClient {
  if (!_instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
      )
    }

    _instance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as AdminClient
  }
  return _instance
}

/** Backwards-compatible named export — lazily calls getAdminClient() on first use */
export const supabaseAdmin: AdminClient = new Proxy({} as AdminClient, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target: AdminClient, prop: string | symbol): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getAdminClient() as any)[prop]
  },
})
