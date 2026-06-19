"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default function LandingPage() {
  const [jackpot, setJackpot] = useState(1248500)
  const [featuredCharity, setFeaturedCharity] = useState<any>(null)

  // Simulate jackpot increasing
  useEffect(() => {
    // Fetch active charity
    const fetchCharity = async () => {
      const { data } = await supabaseAdmin.from('charities').select('*').eq('is_active', true).single()
      if (data) setFeaturedCharity(data)
    }
    fetchCharity()
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 5) + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVaKmpGt33NF21LUYI3axFKIUC95Gs-Af7oi2lY64PqmTv9GpgnExOx3AiNta-fH_MLgBMLpQZQUBe7_dplbPS471Rwq1T2CiOD5UXrS5TMDv3afN9aiMjxOJTd7Y6WHLr8rT-BIfNqIa2yI24BQkqg3pXSGj3XmaK8AfsjLbreRa1QKRk0reiv8OdecMwsPbizqfWcr8SQXETlWWa687mktwab7JKtRlVx7ZrRBlzNmHjnb8KCC_2HXaqMEU24CpgQL2EucKLuQ')] bg-repeat" />

      {/* Hero Section */}
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

          {/* Jackpot Counter */}
          <ScaleIn delay={0.3} className="mt-12 mb-8">
            <p className="font-body text-xs text-gold-400 font-bold tracking-[0.2em] mb-4 uppercase">CURRENT DRAW JACKPOT</p>
            <div className="inline-flex items-baseline gap-2">
              <span className="font-body text-5xl md:text-8xl text-gold-gradient font-bold">$</span>
              <span className="font-body text-6xl md:text-9xl text-gold-gradient font-bold tracking-tighter">
                {jackpot.toLocaleString()}
              </span>
            </div>
            <p className="font-body text-white/70 mt-6 max-w-lg mx-auto text-lg">
              Entries close in 14 days. Every Stableford point logged contributes to the pool and fuels global change.
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

      {/* How It Works Bento Grid */}
      <section id="how-it-works" className="py-32 px-5 md:px-20 max-w-7xl mx-auto">
        <SlideUp className="text-center mb-20">
          <h2 className="font-display text-4xl font-bold mb-4 text-white">The Mechanics of Change</h2>
          <div className="h-1 w-24 bg-gold-gradient mx-auto rounded-full"></div>
        </SlideUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Play */}
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-emerald-400/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Play</h3>
            <p className="font-body text-white/70 leading-relaxed">
              Compete in your local rounds. Log your final Stableford tally directly through our encrypted hero portal. Each point is a testament to your precision.
            </p>
            <div className="mt-auto pt-4 text-gold-400 font-bold text-xs tracking-widest flex items-center gap-2">
              STEP 01 <span className="h-px w-8 bg-gold-400/30"></span>
            </div>
          </StaggerItem>

          {/* Step 2: Transform */}
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-emerald-400/20 shadow-emerald-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Transform</h3>
            <p className="font-body text-white/70 leading-relaxed">
              Our algorithm translates performance into probability. Your scores become digital draw entries, verified on the ledger for total transparency.
            </p>
            <div className="mt-auto pt-4 text-emerald-400 font-bold text-xs tracking-widest flex items-center gap-2">
              STEP 02 <span className="h-px w-8 bg-emerald-400/30"></span>
            </div>
          </StaggerItem>

          {/* Step 3: Impact */}
          <StaggerItem className="glass-card p-10 flex flex-col items-start gap-6 border-gold-400/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Impact</h3>
            <p className="font-body text-white/70 leading-relaxed">
              10% of every entry pool is instantly deployed to our Tier-1 charity partners. You win big, while the world wins bigger.
            </p>
            <div className="mt-auto pt-4 text-gold-400 font-bold text-xs tracking-widest flex items-center gap-2">
              STEP 03 <span className="h-px w-8 bg-gold-400/30"></span>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Charity Highlight: The 10% Legacy */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 px-5 md:px-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <SlideUp>
            <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-6 block uppercase">The Gold Standard of Giving</span>
            <h2 className="font-display text-4xl md:text-6xl text-white font-bold mb-8 leading-tight">
              {featuredCharity ? featuredCharity.name : 'The 10%'} <br /><span className="text-emerald-400 italic font-medium">Legacy</span>
            </h2>
            <p className="font-body text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              {featuredCharity?.description || "At Digital Heroes, your skill on the field transcends the game. We've built a cycle of perpetual philanthropy where every round played contributes to a global fund for human advancement."}
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-6 glass-card p-6 border-l-4 border-l-emerald-400 shadow-emerald-glow">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <div>
                  <p className="font-display font-bold text-white text-xl">${featuredCharity ? Number(featuredCharity.total_contributed || 0).toLocaleString() : '4.2M'} Dispatched</p>
                  <p className="font-body text-white/70">To verified impact initiatives.</p>
                </div>
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
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQmTO6LgQIGQ6qpdO1c5wWyZvDLbyha5k4AnT9MyOYyfPdzSCiHSpulFMIE-wgOSeJ8PSORTdWMJ-9F3lVJMBd63Flwsi-drKw-Uew6Fl3U4Zn9567FqWlij7XhUkg6r1D9LWes0aT5QEOW0w1ezQOACa7bkHA2puTtttJ4GVkMRNjDjQqWMDWFXqnsgZTcCo39SF_PCwz_kbpUweJ9-1KC4gbHupbetcxS7MgUszAF0KgPxrEDD5-SN7bid86ur4NAanI0bgQJw" 
                alt="Charity Impact" 
                loading="lazy"
                className="w-full h-full rounded-full object-cover mix-blend-screen opacity-80" 
              />
            </div>
            {/* Decorative accents */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-400/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 blur-3xl rounded-full"></div>
          </ScaleIn>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-navy-950/50 py-24 border-y border-white/5 backdrop-blur-md">
        <StaggerContainer className="px-5 md:px-20 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StaggerItem className="text-center">
            <p className="font-body text-gold-400 font-bold text-5xl mb-2">12,402</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Active Heroes</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-gold-400 font-bold text-5xl mb-2">$8.5M</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Total Paid</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-emerald-400 font-bold text-5xl mb-2">48</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Global Partners</p>
          </StaggerItem>
          <StaggerItem className="text-center">
            <p className="font-body text-emerald-400 font-bold text-5xl mb-2">98%</p>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Impact Rating</p>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-5 md:px-20 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[40px] text-center shadow-emerald-glow border border-white/10">
          <SlideUp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Your Next Round Could <br /> <span className="text-gold-gradient">Save a Life.</span>
            </h2>
            <p className="font-body text-lg text-white/70 mb-12 max-w-2xl mx-auto">
              Join the exclusive circle of players turning personal victory into global impact. The next draw is approaching.
            </p>
            <div className="relative inline-block group">
              <div className="absolute -inset-4 bg-emerald-400/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Link href="/register">
                <Button size="lg" className="relative btn-primary h-16 px-16 text-lg uppercase tracking-[0.2em] shadow-2xl z-10 font-black">
                  Subscribe Now
                </Button>
              </Link>
            </div>
            <p className="mt-8 font-body text-[10px] text-white/40 tracking-widest font-bold uppercase">
              Secure Encrypted Entrance | 18+ Only | Play Responsibly
            </p>
          </SlideUp>
        </div>
      </section>
    </>
  )
}
