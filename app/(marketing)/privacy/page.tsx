import { SlideUp, FadeIn } from "@/components/ui/motion"

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-4xl mx-auto min-h-dvh">
      <SlideUp>
        <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-4 block uppercase">Legal</span>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-12">
          Privacy Policy
        </h1>
      </SlideUp>

      <FadeIn delay={0.2} className="prose prose-invert prose-emerald max-w-none font-body text-white/70">
        <p className="lead text-xl text-white mb-8">
          Your privacy is paramount. Digital Heroes is committed to protecting your personal data while providing a transparent and secure platform for golf performance tracking and rewards.
        </p>

        <h2 className="text-white font-display mt-12 mb-4">1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li><strong>Profile Data:</strong> Name, email address, and authentication credentials.</li>
          <li><strong>Performance Data:</strong> Golf scores, dates, and course locations entered into the system.</li>
          <li><strong>Verification Data:</strong> Screenshots or photos of scorecards uploaded for winner verification.</li>
          <li><strong>Financial Data:</strong> We do not store payment details. All transactions are securely handled by Razorpay.</li>
        </ul>

        <h2 className="text-white font-display mt-12 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Calculate your performance metrics and eligibility for the monthly algorithmic draw.</li>
          <li>Process subscriptions, prize payouts, and charitable donations.</li>
          <li>Verify the authenticity of winning scores to protect the community.</li>
          <li>Send administrative notifications, draw results, and platform updates.</li>
        </ul>

        <h2 className="text-white font-display mt-12 mb-4">3. Data Sharing and Disclosure</h2>
        <p>
          Digital Heroes does not sell or rent your personal information to third parties. We may share data only in the following circumstances:
        </p>
        <ul>
          <li><strong>Charity Partners:</strong> Aggregated, anonymized contribution data is shared with our charity partners. Your individual donation details are only shared if you explicitly opt-in.</li>
          <li><strong>Service Providers:</strong> We use trusted third parties like Supabase for infrastructure and Razorpay for payments.</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect the rights and safety of our platform and users.</li>
        </ul>

        <h2 className="text-white font-display mt-12 mb-4">4. Data Security</h2>
        <p>
          We implement industry-standard security measures, including Row Level Security (RLS) policies on our databases, to prevent unauthorized access, disclosure, or alteration of your data.
        </p>

        <div className="mt-16 p-6 glass-card rounded-xl border border-white/10">
          <p className="text-sm m-0">Last Updated: June 2026<br/>Contact: privacy@digitalheroes.co.in</p>
        </div>
      </FadeIn>
    </div>
  )
}
