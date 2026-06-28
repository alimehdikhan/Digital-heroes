import { SlideUp, FadeIn } from "@/components/ui/motion"

export default function DrawRulesPage() {
  return (
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-4xl mx-auto min-h-dvh">
      <SlideUp>
        <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-4 block uppercase">Rules</span>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-12">
          Draw Rules
        </h1>
      </SlideUp>

      <FadeIn delay={0.2} className="prose prose-invert prose-emerald max-w-none font-body text-white/70">
        <p className="lead text-xl text-white mb-8">
          Every round you play is a ticket to the monthly draw. Here&apos;s exactly how it works — transparent, fair, and algorithmic.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">1. Eligibility</h2>
        <p>
          To qualify for the monthly draw, a user must:
        </p>
        <ul>
          <li>Maintain an active subscription (monthly or yearly).</li>
          <li>Have at least 5 verified Stableford scores entered into the system.</li>
          <li>Be in good standing — no violations of the Code of Honor.</li>
        </ul>

        <h2 className="text-white font-display mt-12 mb-4">2. Scoring System</h2>
        <p>
          All scores are recorded using the Stableford points system (1–45). Each round must be entered within 7 days of play. Only one score per date is permitted. If you enter a new score and already have 5 rounds on record, the oldest round is automatically archived.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">3. Draw Cadence</h2>
        <p>
          Draws occur on a monthly basis. The draw window opens on the 1st of each month and closes on the last day. Results are published within 48 hours of the draw execution. Admin reserves the right to adjust the draw schedule with 7 days&apos; notice.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">4. Prize Tiers</h2>
        <p>
          The prize pool is split into three tiers based on the number of matching criteria:
        </p>
        <ul>
          <li><strong className="text-white">Jackpot (5-match):</strong> 40% of the pool — grand prize for perfect alignment.</li>
          <li><strong className="text-white">Silver (4-match):</strong> 35% of the pool — strong performance bracket.</li>
          <li><strong className="text-white">Bronze (3-match):</strong> 25% of the pool — honorable mention bracket.</li>
        </ul>
        <p>
          Silver and bronze tier prizes are distributed only when winners exist in those tiers. If no player achieves a 5-number match, the jackpot allocation (40%) rolls over and is added to the next month&apos;s jackpot pool.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">5. Prize Splitting</h2>
        <p>
          If multiple users qualify in the same tier, the tier prize is divided equally among the winners. Winnings are disbursed within 14 days of winner verification via the user&apos;s selected payout method.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">6. Winner Verification</h2>
        <p>
          Winners must upload a screenshot or photo of their winning scorecard as proof. This submission is reviewed by the admin team. Payments are only processed after proof is approved. If proof is rejected, the winner has 7 days to resubmit.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">7. Charitable Contribution</h2>
        <p>
          A minimum of 10% of every draw pool is allocated to verified charity partners. Users select their preferred charity during registration and may change it at any time from their dashboard.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">8. Draw Modes</h2>
        <p>
          The admin may select between two draw modes each month:
        </p>
        <ul>
          <li><strong className="text-white">Random Draw:</strong> Five winning numbers are generated randomly from the 1–45 Stableford range.</li>
          <li><strong className="text-white">Algorithmic Draw:</strong> Winning numbers are weighted by the most and least frequent scores submitted across all eligible participants.</li>
        </ul>

        <h2 className="text-white font-display mt-12 mb-4">9. Disputes</h2>
        <p>
          Any dispute regarding draw results, prize distribution, or eligibility must be submitted in writing within 14 days of the draw publication. The admin team&apos;s decision is final and binding.
        </p>

        <div className="mt-16 p-6 glass-card rounded-xl border border-white/10">
          <p className="text-sm m-0">Last Updated: June 2026<br/>Contact: legal@digitalheroes.co.in</p>
        </div>
      </FadeIn>
    </div>
  )
}
