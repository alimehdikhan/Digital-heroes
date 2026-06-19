"use client"

import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"

import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: charity } = await supabaseAdmin.from('charities').select('*').eq('id', id).single()

  if (!charity) return <div className="p-20 text-center text-white">Charity not found</div>

  const events = charity.events || []

  return (
    <div className="bg-navy-950 min-h-dvh">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center brightness-50 contrast-125 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuEGEHxieATpWDz_3xndMro4wncatG-WuDNf_DqV8NLDDD-YRU0V6oFpVXfEKL36ytfx5vZNKTfaq0LNKpGYuVexJb54OerHy7O20pKB9F7nvBfd-Kb18ZcVmeF_VNLWah9odRxDT9ITnKXSFHK_hZy48BiaxpLQbUWuwE9n_0vXwvLGOuMBI3Cy1GM6V3imu6riQc3U6FE7slX-bHdCTtcXXg8jqJgDNDEiK7hbg_Y3oSr_hMg8QCqvQ')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-transparent to-transparent"></div>
        </div>
        
        <SlideUp className="relative z-10 text-center max-w-4xl px-4 mt-20">
          <span className="font-body text-xs text-emerald-400 font-bold mb-6 block tracking-[0.2em] uppercase">VERIFIED PARTNER</span>
          <h1 className="font-display text-5xl md:text-7xl text-white font-bold mb-8 leading-tight">
            {charity.name}
          </h1>
          <p className="font-body text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {charity.description || "Empowering communities through verified impact initiatives."}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Button size="lg" className="h-16 px-12 btn-primary uppercase tracking-widest font-black text-navy-950 shadow-emerald-glow border-none bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500">
              Commit Support
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 uppercase tracking-widest font-black bg-transparent">
              Independent Donation
            </Button>
          </div>
        </SlideUp>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-5 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <SlideUp className="space-y-8">
            <h2 className="font-display text-4xl md:text-5xl text-white font-bold">The <span className="text-emerald-400 italic">Mission</span></h2>
            <p className="text-white/70 font-body text-lg leading-relaxed">
              {charity.description || "We are dedicated to sustainable change and verifiable impact."}
            </p>
            <div className="glass-card p-8 rounded-2xl space-y-4 shadow-emerald-glow border border-emerald-400/20">
              <div className="flex items-center gap-4 text-emerald-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                <h4 className="font-body text-xs font-bold uppercase tracking-widest">HIGH-TECH FILTRATION</h4>
              </div>
              <p className="text-white/70 font-body">Deploying graphene-based membranes capable of extracting 99.9% of pathogens with zero energy waste.</p>
            </div>
          </SlideUp>
          
          <StaggerContainer className="grid grid-cols-2 gap-6">
            <StaggerItem className="glass-card aspect-square rounded-2xl overflow-hidden group border border-white/10">
              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHNT1J9Y_P6YX6ZAEm4bUXQYlvg1TZKpRR2z1cCsS3QgQfYphpgtsCtTA7CCQt76D9Ujg2293wFbkuxN9dajA1KJ-nMH1vTim40AvP94JgdIXLE5MtjZKCnYAa5mURggz3Bg6ZagHTLk1auEyaX-7UlTtBr_BUWfzM_5bQ1HRgthiyKr4O66kK9pnvB6BBT4GzFvsDUVxWbLEOoNCtRaZLJENJ1FuzFcfYCBAqzph_tq3cWOMkR0dr_1YPMf16Ct77Egt3xbF_AQ')" }}></div>
            </StaggerItem>
            <StaggerItem className="glass-card aspect-square rounded-2xl overflow-hidden mt-12 group border border-white/10">
              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhmg8RD5fyHFXRF7i3dO8OzQhrZhnaJVPQMfcc75uGYx0FWBzMWXuAyOwkaZHK4Z4rYAA_17oKpxcBNJV94ogFRW1A44P54GDopotLmMj84ilOLCAqWXXfJlN__cm0hYge_cQvmhxcpzG88YAS-1Ny_KCjcxk0uhJAg-67pwEa1NbTFtb1GSY-_H3esFLyNPf1H-v_J7VJXFnnJfNZpp1tc6TvbPQPoqDseCJ1mZqVY1wwfuUAJun6Rr5PGurBS7fEmwFucx4Hwg')" }}></div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-navy-900/50 py-24 border-y border-white/5">
        <StaggerContainer className="max-w-7xl mx-auto px-5 md:px-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <StaggerItem className="space-y-4 relative">
              <div className="text-emerald-400 mb-4 flex justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg></div>
              <h3 className="font-display text-5xl md:text-6xl text-emerald-400 font-bold drop-shadow-md">$4.2M</h3>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Capital Dispatched</p>
            </StaggerItem>
            <StaggerItem className="space-y-4 relative">
              <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 h-24 w-px bg-white/10"></div>
              <div className="text-gold-400 mb-4 flex justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
              <h3 className="font-display text-5xl md:text-6xl text-gold-400 font-bold drop-shadow-md">12</h3>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Projects Funded</p>
              <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 h-24 w-px bg-white/10"></div>
            </StaggerItem>
            <StaggerItem className="space-y-4 relative">
              <div className="text-emerald-400 mb-4 flex justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3 className="font-display text-5xl md:text-6xl text-emerald-400 font-bold drop-shadow-md">850k</h3>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">Lives Impacted</p>
            </StaggerItem>
          </div>
        </StaggerContainer>
      </section>

      {/* Field Reports / Events Section */}
      <section className="py-24 px-5 md:px-20 max-w-7xl mx-auto">
        <FadeIn className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-gold-400 font-body text-xs uppercase tracking-widest font-bold mb-4 block">LIVE UPDATES</span>
            <h2 className="font-display text-4xl md:text-5xl text-white font-bold">Events & Field Reports</h2>
          </div>
        </FadeIn>

        {events.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((update: any, i: number) => (
              <StaggerItem key={i} className="glass-card group rounded-2xl overflow-hidden hover:border-gold-400/30 transition-all border border-white/10 flex flex-col">
                {update.img && (
                  <div className="h-64 overflow-hidden bg-navy-900 shrink-0">
                    <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${update.img}')` }}></div>
                  </div>
                )}
                <div className="p-8 space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(80,200,120,0.8)]"></span>
                    <span className="text-emerald-400 font-body text-[10px] uppercase font-bold tracking-widest">{update.date || 'UPCOMING'}</span>
                  </div>
                  <h4 className="font-display text-2xl font-bold text-white leading-tight">{update.title}</h4>
                  <p className="text-white/70 font-body text-sm leading-relaxed mt-auto">{update.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-white/50 text-center glass-card p-10 rounded-2xl">
            No upcoming events or reports at this time.
          </div>
        )}
      </section>
    </div>
  )
}
