import { SlideUp } from "@/components/ui/motion"
import { PricingPlans } from "./PricingPlans"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export default async function PricingPage() {
  // Fetch active charities for the selection dropdown
  const { data: charities } = await supabaseAdmin
    .from('charities')
    .select('id, name')
    .eq('is_active', true)
    .eq('is_deleted', false)

  // Detect user's preferred currency if logged in
  let preferredCurrency: string | undefined
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single()
      if (profile?.currency) {
        preferredCurrency = profile.currency
      }
    }
  } catch {
    // Silent fallback — user not logged in or error fetching profile
  }

  return (
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-7xl mx-auto min-h-dvh flex flex-col items-center">
      <SlideUp className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl text-white font-bold mb-6">
          Choose Your <span className="text-gold-gradient italic">Legacy</span>
        </h1>
        <p className="font-body text-lg text-white/70">
          Unlock your potential. Every round you log contributes to the jackpot, and 10% always goes to charity. Choose the plan that fits your game.
        </p>
      </SlideUp>

      <PricingPlans charities={charities || []} preferredCurrency={preferredCurrency} />
    </div>
  )
}
