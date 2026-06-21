import { FadeIn, SlideUp } from "@/components/ui/motion"
import Link from "next/link"
import { getLatestScores } from "@/app/actions/scores"
import { ScoreForm } from "./ScoreForm"
import { ScoreManager } from "@/app/(app)/dashboard/ScoreManager"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { isSubscriptionActive } from "@/lib/utils/subscription"

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expires_at')
    .eq('id', user?.id)
    .single()

  const hasAccess = isSubscriptionActive(profile)
  const latestScores = await getLatestScores()

  return (
    <div className="space-y-12 pb-12">
      <SlideUp className="flex flex-col items-center mb-16 text-center pt-8">
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Initialize Performance Log</h1>
        <p className="text-white/70 max-w-lg mx-auto font-body">Enter your Stableford scores (1–45). Only your latest five are kept; one score per date.</p>
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7">
          <FadeIn delay={0.2} className="glass-card shadow-emerald-glow rounded-3xl p-8 md:p-12 relative overflow-hidden border border-emerald-400/20 min-h-[400px] flex flex-col justify-center">
            {!hasAccess ? (
              <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                <h3 className="font-display text-2xl text-white font-bold mb-3">Subscription Required</h3>
                <p className="text-white/60 font-body mb-8 max-w-sm">Activate a subscription to submit scores and enter monthly draws.</p>
                <Link href="/pricing">
                  <Button className="h-12 bg-gold-gradient text-navy-950 font-body uppercase tracking-[0.2em] font-black border-none rounded-xl px-8">
                    Unlock Access
                  </Button>
                </Link>
              </div>
            ) : (
              <ScoreForm />
            )}
          </FadeIn>
        </section>

        <section className="lg:col-span-5 space-y-6">
          <FadeIn delay={0.4}>
            <h2 className="font-display text-2xl text-white font-bold px-2">Recent Scores</h2>
          </FadeIn>
          <ScoreManager initialScores={latestScores} />
        </section>
      </div>
    </div>
  )
}
