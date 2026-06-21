import { SlideUp, FadeIn } from "@/components/ui/motion"

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-4xl mx-auto min-h-dvh">
      <SlideUp>
        <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-4 block uppercase">Connect</span>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-6">
          Contact Us
        </h1>
      </SlideUp>

      <FadeIn delay={0.2}>
        <p className="text-white/70 text-lg mb-12 max-w-2xl font-body">
          Have a question, a suggestion, or a story to share? We&apos;d love to hear from you.
          Reach out to the Digital Heroes team and we&apos;ll get back to you within 24 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 glass-card rounded-xl border border-white/10 hover:border-emerald-400/30 transition-colors">
            <h3 className="font-display text-white font-semibold mb-2">General Inquiries</h3>
            <p className="text-white/50 text-sm mb-3 font-body">
              Questions about the platform, subscriptions, or your account.
            </p>
            <a
              href="mailto:hello@digitalheroes.co.in"
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              hello@digitalheroes.co.in
            </a>
          </div>

          <div className="p-6 glass-card rounded-xl border border-white/10 hover:border-emerald-400/30 transition-colors">
            <h3 className="font-display text-white font-semibold mb-2">Support</h3>
            <p className="text-white/50 text-sm mb-3 font-body">
              Technical issues, score corrections, or account help.
            </p>
            <a
              href="mailto:support@digitalheroes.co.in"
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              support@digitalheroes.co.in
            </a>
          </div>

          <div className="p-6 glass-card rounded-xl border border-white/10 hover:border-emerald-400/30 transition-colors">
            <h3 className="font-display text-white font-semibold mb-2">Charity Partnership</h3>
            <p className="text-white/50 text-sm mb-3 font-body">
              Interested in becoming a verified charity partner?
            </p>
            <a
              href="mailto:charities@digitalheroes.co.in"
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              charities@digitalheroes.co.in
            </a>
          </div>

          <div className="p-6 glass-card rounded-xl border border-white/10 hover:border-emerald-400/30 transition-colors">
            <h3 className="font-display text-white font-semibold mb-2">Press & Media</h3>
            <p className="text-white/50 text-sm mb-3 font-body">
              Media inquiries, partnerships, and brand collaborations.
            </p>
            <a
              href="mailto:press@digitalheroes.co.in"
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              press@digitalheroes.co.in
            </a>
          </div>
        </div>

        <div className="p-8 glass-card rounded-xl border border-white/10">
          <h2 className="font-display text-white font-semibold text-xl mb-6">
            Send Us a Message
          </h2>            <form
            action="mailto:hello@digitalheroes.co.in"
            method="GET"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm text-white/70 font-medium mb-2 font-body">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="subject"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all font-body text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-white/70 font-medium mb-2 font-body">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all font-body text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-white/70 font-medium mb-2 font-body">
                Message
              </label>
              <textarea
                id="message"
                name="body"
                rows={5}
                placeholder="Tell us what&apos;s on your mind..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all font-body text-sm resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-gold-gradient text-navy-950 font-bold px-8 py-3 rounded-lg hover:shadow-gold-glow transition-all hover:scale-105 font-display"
            >
              Send Message
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
