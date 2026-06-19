import { SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Script from "next/script"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DonateButton } from "@/components/DonateButton"

export default async function CharitiesPage({ searchParams }: { searchParams: Promise<{ q?: string, filter?: string }> }) {
  const { q, filter } = await searchParams;

  // Fetch real charities from DB
  let query = supabaseAdmin
    .from('charities')
    .select('*')
    .eq('is_deleted', false)
    
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  
  if (filter === 'active') {
    query = query.eq('is_active', true)
  }

  const { data: dbCharities } = await query
    .order('is_active', { ascending: false })
    .order('total_contributed', { ascending: false })

  const charities = dbCharities && dbCharities.length > 0
    ? dbCharities
    : null

  return (
    <>
    <div className="pt-32 pb-24 px-5 md:px-20 max-w-7xl mx-auto min-h-dvh flex flex-col items-center">
      <SlideUp className="text-center mb-20 max-w-3xl mx-auto">
        <span className="font-body text-xs text-emerald-400 font-bold tracking-[0.4em] mb-6 block uppercase">The Gold Standard of Giving</span>
        <h1 className="font-display text-4xl md:text-6xl text-white font-bold mb-6">
          The 10% <span className="text-emerald-400 italic">Legacy</span>
        </h1>
        <p className="font-body text-lg text-white/70 leading-relaxed mb-8">
          Ten percent of every draw pool is immediately deployed to our verified charity partners. 
          Your precision on the course translates directly to human advancement.
        </p>
        <form method="GET" className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
          <input 
            type="text" 
            name="q" 
            defaultValue={q || ""} 
            placeholder="Search charities..." 
            className="flex-1 bg-navy-900 border border-white/20 rounded-xl px-4 py-3 text-white font-body"
          />
          <select name="filter" defaultValue={filter || ""} className="bg-navy-900 border border-white/20 rounded-xl px-4 py-3 text-white font-body">
            <option value="">All</option>
            <option value="active">Active Only</option>
          </select>
          <Button type="submit" className="btn-primary uppercase tracking-widest font-black text-navy-950">Search</Button>
        </form>
      </SlideUp>

      {charities ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {charities.map((charity, idx) => (
            <StaggerItem key={charity.id} className="glass-card rounded-[24px] overflow-hidden group border border-white/5 hover:border-white/10 transition-colors">
              {/* Header */}
              <div className="h-40 relative overflow-hidden bg-navy-900 border-b border-white/10">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${idx % 2 === 0 ? 'from-emerald-400 to-transparent' : 'from-gold-400 to-transparent'}`}></div>
                <div className={`absolute bottom-0 left-8 translate-y-1/2 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md z-10 ${idx % 2 === 0 ? 'bg-emerald-400/20 text-emerald-400' : 'bg-gold-400/20 text-gold-400'}`}>
                  {charity.is_active ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  )}
                </div>
                {charity.is_active && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-400/30">Featured</span>
                  </div>
                )}
              </div>
              
              <div className="p-8 pt-12">
                <h3 className="font-display text-2xl font-bold text-white mb-3">{charity.name}</h3>
                <p className="font-body text-white/70 leading-relaxed mb-8">
                  {charity.description || 'Supporting impactful initiatives for a better world.'}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <p className={`font-display text-2xl font-bold ${idx % 2 === 0 ? 'text-emerald-400' : 'text-gold-400'}`}>
                      ${Number(charity.total_contributed || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                    <p className="font-body text-xs text-white/50 uppercase tracking-widest font-bold">
                      Total Contributed
                    </p>
                  </div>
                {charity.website_url && (
                  <a href={charity.website_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" className="text-white hover:bg-white/5 hover:text-white">
                      Visit Site &rarr;
                    </Button>
                  </a>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Link href={`/charities/${charity.id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-10 border-white/20 text-white hover:bg-white/5 uppercase tracking-widest font-bold text-[10px] bg-transparent">
                    Learn More
                  </Button>
                </Link>
                <DonateButton charityId={charity.id} charityName={charity.name} />
              </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="glass-card rounded-[24px] p-12 text-center w-full max-w-2xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400 mx-auto mb-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <h3 className="font-display text-2xl text-white font-bold mb-3">Charity Partners Coming Soon</h3>
          <p className="text-white/50 font-body">Our verified charity partners will be announced shortly. Every draw contributes 10% to global change.</p>
        </div>
      )}

      <ScaleIn delay={0.4} className="mt-24 text-center">
        <p className="font-body text-white/50 mb-6 max-w-lg mx-auto">
          Know a verified charitable organization doing incredible work? Legends can nominate future partners.
        </p>
        <Link href="/register?plan=annual">
          <Button variant="outline" className="h-12 border-white/20 hover:bg-white/5 text-white uppercase tracking-widest font-bold text-xs bg-transparent">
            Become a Legend to Nominate
          </Button>
        </Link>
      </ScaleIn>
    </div>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </>
  )
}
