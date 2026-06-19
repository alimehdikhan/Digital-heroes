import { SlideUp, FadeIn } from "@/components/ui/motion"

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-4xl mx-auto min-h-dvh">
      <SlideUp>
        <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-4 block uppercase">Legal</span>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-12">
          Terms of Service
        </h1>
      </SlideUp>

      <FadeIn delay={0.2} className="prose prose-invert prose-emerald max-w-none font-body text-white/70">
        <p className="lead text-xl text-white mb-8">
          Welcome to Digital Heroes. By accessing our platform, you agree to these terms, designed to protect our community of legends and ensure the integrity of our impact operations.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Digital Heroes platform, subscribing to our services, or participating in any draws, you accept and agree to be bound by the terms and provisions of this agreement.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">2. Subscription and Billing</h2>
        <p>
          Subscriptions are billed in advance on a monthly or annual basis and are non-refundable. There will be no refunds or credits for partial months of service, upgrade/downgrade refunds, or refunds for months unused.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">3. Code of Honor</h2>
        <p>
          Digital Heroes relies on the integrity of its members. You agree to submit only authentic, verified golf scores. Any attempt to manipulate scores, forge winner verification screenshots, or exploit the algorithmic vault will result in immediate termination of your account and forfeiture of any pending winnings.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">4. Draw Participation and Winnings</h2>
        <p>
          To be eligible for the monthly draw, a user must maintain an active subscription and have at least 5 verified rounds entered in the system. Winnings are calculated algorithmically based on the total pool and tier brackets. All payouts are subject to manual verification of the winning scorecard.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">5. Charitable Contributions</h2>
        <p>
          A mandatory 10% of every draw pool is directed to verified charity partners. Users may select their preferred charity from our vetted list or allow the platform to distribute it evenly. Independent donations are processed separately and passed 100% to the chosen organization.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">6. Modifications to Service</h2>
        <p>
          Digital Heroes reserves the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
        </p>

        <div className="mt-16 p-6 glass-card rounded-xl border border-white/10">
          <p className="text-sm m-0">Last Updated: June 2026<br/>Contact: legal@digitalheroes.co.in</p>
        </div>
      </FadeIn>
    </div>
  )
}
