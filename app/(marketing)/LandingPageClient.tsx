"use client"

import Link from "next/link"
import Image from "next/image"
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import type { PublicStats } from "@/lib/public-stats"

const DEFAULT_CHARITY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDQmTO6LgQIGQ6qpdO1c5wWyZvDLbyha5k4AnT9MyOYyfPdzSCiHSpulFMIE-wgOSeJ8PSORTdWMJ-9F3lVJMBd63Flwsi-drKw-Uew6Fl3U4Zn9567FqWlij7XhUkg6r1D9LWes0aT5QEOW0w1ezQOACa7bkHA2puTtttJ4GVkMRNjDjQqWMDWFXqnsgZTcCo39SF_PCwz_kbpUweJ9-1KC4gbHupbetcxS7MgUszAF0KgPxrEDD5-SN7bid86ur4NAanI0bgQJw"

export function LandingPageClient({ stats }: { stats: PublicStats }) {
  const featuredCharity = stats.featuredCharity
  const jackpot = Math.round(stats.currentJackpot)

  return (
    <>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVaKmpGt33NF21LUYI3axFKIUC95Gs-Af7oi2lY64PqmTv9GpgnExOx3AiNta-fH_MLgBMLpQZQUBe7_dplbPS471Rwq1T2CiOD5UXrS5TMDv3afN9aiMjxOJTd7Y6WHLr8rT-BIfNqIa2yI24BQkqg3pXSGj3XmaK8AfsjLbreRa1QKRk0reiv8OdecMwsPbizqfWcr8SQXETlWWa687mktwab7JKtRlVx7ZrRBlzNmHjnb8KCC_2HXaqMEU24CpgQL2EucKLuQ')] bg-repeat" />

      <section className="relative min-h-dvh flex flex-col items-center justify-center pt-32 pb-20 px-5 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto mt-10">
          <SlideUp delay={0.1}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight text-white tracking-tight">
              The Score That <br />
              <span className="text-gold-gradient">Changes Everything</span>
            </h1>
          </SlideUp>

          <ScaleIn delay={0.3} className="mt-12 mb-8">
            <p className="font-body text-xs text-gold-400 font-bold tracking-[0.2em] mb-4 uppercase">CURRENT DRAW JACKPOT</p>
            <div className="inline-flex items-baseline gap-2">
              <span className="font-body text-5xl md:text-8xl text-gold-gradient font-bold">₹</span>
              <span className="font-body text-6xl md:text-9xl text-gold-gradient font-bold tracking-tighter">
                {jackpot.toLocaleString()}
              </span>
            </div>
            <p className="font-body text-white/70 mt-6 max-w-lg mx-auto text-lg">
              Entries close in {stats.daysUntilDraw} day{stats.daysUntilDraw === 1 ? '' : 's'}. Every Stableford point logged contributes to the pool and fuels global change.
            </p>
          </ScaleIn>

          <FadeIn delay={0.6} className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link href="/register">
              <Button size="lg" className="btn-primary text-lg h-16 px-12 uppercase tracking-widest">
                Be a Hero
              </Button>
            </Link>
            <Link href="/draw-history">
              <Button size="lg" variant="outline" className="h-16 px-12 border-gold-400/40 text-gold-400 hover:bg-gold-400/10 uppercase tracking-widest text-lg bg-transparent">
                View Winners
              </Button>
            </Link>
          </FadeIn>
        </div>

        <FadeIn delay={1} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-400/40">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </FadeIn>
      </section>

      <section id="how-it-works" className="py-32 px-5 md:px-20 max-w-7xl mx-auto">
        <SlideUp className="text-center mb-20">
          <h2 className="font-display text-4xl font-bold mb-4 text-white">The Mechanics of Change</h2>
          <div className="h-1 w-24 bg-gold-gradient mx-auto rounded-full"></div>
        </SlideUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-emerald-400/10 relative overflow-hidden group">
            <h3 className="font-display text-2xl font-bold text-white">Play</h3>
            <p className="font-body text-white/70 leading-relaxed">
              Log your last five Stableford scores. Each round builds your draw entry for the monthly prize pool.
            </p>
          </StaggerItem>
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-emerald-400/20 shadow-emerald-glow relative overflow-hidden group">
            <h3 className="font-display text-2xl font-bold text-white">Transform</h3>
            <p className="font-body text-white/70 leading-relaxed">
              Five winning numbers are drawn each month. Match 3, 4, or 5 scores to win tier prizes — with jackpot rollover if unclaimed.
            </p>
          </StaggerItem>
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-gold-400/10 relative overflow-hidden group">
            <h3 className="font-display text-2xl font-bold text-white">Impact</h3>
            <p className="font-body text-white/70 leading-relaxed">
              At least 10% of every subscription supports your chosen charity. You compete; the world benefits.
            </p>
          </StaggerItem>
        </StaggerContainer>
      </section>

      <section className="relative py-32 overflow-hidden">
        <div className="relative z-10 px-5 md:px-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <SlideUp>
            <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-6 block uppercase">Featured Charity</span>
            <h2 className="font-display text-4xl md:text-6xl text-white font-bold mb-8 leading-tight">
              {featuredCharity ? featuredCharity.name : 'The 10%'} <br /><span className="text-emerald-400 italic font-medium">Legacy</span>
            </h2>
            <p className="font-body text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              {featuredCharity?.description || "Every subscription fuels verified charity partners alongside the monthly draw."}
            </p>
            <div className="flex items-center gap-6 glass-card p-6 border-l-4 border-l-emerald-400 shadow-emerald-glow">
              <div>
                <p className="font-display font-bold text-white text-xl">₹{Number(featuredCharity?.total_contributed || stats.totalCharityContributed).toLocaleString()} Dispatched</p>
                <p className="font-body text-white/70">To verified impact initiatives.</p>
              </div>
            </div>
            {featuredCharity && (
              <div className="mt-8">
                <Link href={`/charities/${featuredCharity.id}`}>
                  <Button variant="outline" className="text-emerald-400 border-emerald-400/40 hover:bg-emerald-400/10">Read the Full Report &rarr;</Button>
                </Link>
              </div>
            )}
          </SlideUp>

          <ScaleIn delay={0.2} className="relative">
            <div className="aspect-square glass-card rounded-full p-2 flex items-center justify-center overflow-hidden border border-white/10">
              <Image
                src={featuredCharity?.hero_image_url || DEFAULT_CHARITY_IMAGE}
                alt="Charity Impact"
                width={800}
                height={800}
                className="w-full h-full rounded-full object-cover mix-blend-screen opacity-80"
              />
            </div>
          </ScaleIn>
        </div>
      </section>

      <section className="bg-navy-950/50 py-24 border-y border-white/5 backdrop-blur-md">
        <StaggerContainer className="px-5 md:px-20 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StaggerItem className="text-center">
            <p className="font-body text-gold-400 font-bold text-5xl mb-2">{stats.activeHeroes.toLocaleString()}</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Active Heroes</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-gold-400 font-bold text-5xl mb-2">₹{Math.round(stats.totalPaid).toLocaleString()}</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Total Paid</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-emerald-400 font-bold text-5xl mb-2">{stats.charityPartners}</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Charity Partners</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-emerald-400 font-bold text-5xl mb-2">₹{Math.round(stats.totalCharityContributed).toLocaleString()}</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Charity Raised</p>
          </StaggerItem>
        </StaggerContainer>
      </section>

      <section className="relative py-32 px-5 md:px-20 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[40px] text-center shadow-emerald-glow border border-white/10">
          <SlideUp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Your Next Round Could <br /> <span className="text-gold-gradient">Save a Life.</span>
            </h2>
            <p className="font-body text-lg text-white/70 mb-12 max-w-2xl mx-auto">
              Join the exclusive circle of players turning personal victory into global impact. The next draw is approaching.
            </p>
            <Link href="/register">
              <Button size="lg" className="relative btn-primary h-16 px-16 text-lg uppercase tracking-[0.2em] shadow-2xl z-10 font-black">
                Subscribe Now
              </Button>
            </Link>
          </SlideUp>
        </div>
      </section>
    </>
  )
}
