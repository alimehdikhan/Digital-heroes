import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/5 rounded-full blur-[100px] z-0"></div>
      
      <div className="glass-card relative z-10 max-w-lg w-full p-8 md:p-12 rounded-[32px] border border-white/10 text-center">
        <h1 className="font-display text-8xl md:text-9xl text-gold-400 font-bold mb-4 drop-shadow-lg">404</h1>
        
        <h2 className="font-display text-2xl text-white font-bold mb-4 uppercase tracking-widest">Sector Not Found</h2>
        <p className="text-white/70 font-body text-sm mb-10 leading-relaxed max-w-sm mx-auto">
          The coordinates you entered do not match any known sector in the Digital Heroes network. The transmission may have been lost.
        </p>
        
        <Link href="/">
          <Button 
            className="w-full md:w-auto px-12 h-14 rounded-xl font-body font-black uppercase tracking-[0.1em] text-sm transition-all flex items-center justify-center gap-2 btn-primary border-none shadow-gold-glow"
          >
            Return to Base
          </Button>
        </Link>
      </div>
    </div>
  )
}
