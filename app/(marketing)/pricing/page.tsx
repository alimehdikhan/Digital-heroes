import { SlideUp } from "@/components/ui/motion"
import { PricingPlans } from "./PricingPlans"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function PricingPage() {
  // Fetch active charities for the selection dropdown
  const { data: charities } = await supabaseAdmin
    .from('charities')
    .select('id, name')
    .eq('is_active', true)
    .eq('is_deleted', false)

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

      <PricingPlans charities={charities || []} />
    </div>
  )
}
