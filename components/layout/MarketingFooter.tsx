import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="bg-navy-950 border-t border-white/10 pt-16 pb-8">
      <div className="section-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-navy-950 font-black font-display tracking-tighter">
                DH
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Digital Heroes
              </span>
            </Link>
            <p className="text-white/50 max-w-sm mt-4 text-sm leading-relaxed">
              Your Stableford scores become your lottery ticket. Monthly jackpots, real charity impact, and a community of true heroes.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/#how-it-works" className="hover:text-gold-400 transition-colors">How it Works</Link></li>
              <li><Link href="/pricing" className="hover:text-gold-400 transition-colors">Pricing</Link></li>
              <li><Link href="/charities" className="hover:text-gold-400 transition-colors">Our Charities</Link></li>
              <li><Link href="/draw-history" className="hover:text-gold-400 transition-colors">Draw History</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/rules" className="hover:text-gold-400 transition-colors">Draw Rules</Link></li>
              <li><Link href="/contact" className="hover:text-gold-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Digital Heroes. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <span>Built for the </span>
            <span className="text-emerald-400 font-medium">love of the game</span>
            <span> & the </span>
            <span className="text-gold-400 font-medium">spirit of giving.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
