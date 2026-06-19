"use client"

import { useState } from "react"
import { StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { createSubscription } from "@/app/actions/subscription"
import Script from "next/script"
import { useRouter } from "next/navigation"

export function PricingPlans({ charities }: { charities: any[] }) {
  const [selectedCharity, setSelectedCharity] = useState<string>("")
  const [charityPercentage, setCharityPercentage] = useState<number>(10)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setLoading(plan)
      const res = await createSubscription(plan, selectedCharity || null, charityPercentage)
      
      if (res.error) {
        if (res.error === 'Unauthorized') {
          router.push('/login?next=/pricing')
          return
        }
        throw new Error(res.error)
      }

      if (res.simulated) {
        // Dev fallback
        router.push('/dashboard?checkout=simulated_success')
        return
      }

      const options = {
        key: res.keyId,
        subscription_id: res.subscriptionId,
        name: 'Digital Heroes',
        description: `${plan === 'monthly' ? 'Monthly Hero' : 'Annual Legend'} Subscription`,
        handler: function (response: any) {
          router.push('/dashboard?checkout=success&payment_id=' + response.razorpay_payment_id)
        },
        theme: {
          color: '#50C878', // emerald-400
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any){
        console.error('Payment failed', response.error)
      })
      rzp.open()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <StaggerItem className="glass-card rounded-[32px] p-10 flex flex-col h-full relative group border border-white/5 hover:border-white/10 transition-all">
          <div className="mb-8">
            <h3 className="font-body text-sm text-white/50 uppercase tracking-[0.2em] font-bold mb-2">Monthly Hero</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-5xl text-white font-bold">₹1,999</span>
              <span className="font-body text-white/50">/month</span>
            </div>
            <p className="font-body text-white/70 text-sm">Flexible access to the arena. Perfect for weekend warriors.</p>
          </div>

          <div className="space-y-4 mb-10 flex-1">
            {['Monthly Jackpot entry per score', '10% Charity contribution', 'Verified Ledger tracking', 'Basic statistics'].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                <span className="font-body text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <Button 
              onClick={() => handleSubscribe('monthly')} 
              disabled={loading !== null}
              className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-body uppercase tracking-widest rounded-xl transition-all font-bold"
            >
              {loading === 'monthly' ? 'Processing...' : 'Select Monthly'}
            </Button>
          </div>
        </StaggerItem>

        {/* Annual Plan */}
        <StaggerItem className="glass-card rounded-[32px] p-10 flex flex-col h-full relative group border-2 border-gold-400/30 shadow-gold-glow overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-400/10 blur-3xl rounded-full" />
          
          <div className="absolute top-8 right-8">
            <span className="bg-gold-gradient text-navy-950 font-body text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full">
              Best Value
            </span>
          </div>

          <div className="mb-8 relative z-10">
            <h3 className="font-body text-sm text-gold-400 uppercase tracking-[0.2em] font-bold mb-2">Annual Legend</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-5xl text-gold-400 font-bold">₹19,999</span>
              <span className="font-body text-white/50">/year</span>
            </div>
            <p className="font-body text-white/70 text-sm">Two months free. For the dedicated players building a lasting legacy.</p>
          </div>

          <div className="space-y-4 mb-6 flex-1 relative z-10">
            {['Everything in Monthly, plus:', 'Premium analytics & insights', 'Priority draw placements', 'Exclusive "Legend" profile badge', 'Direct input on charity selection'].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
                <span className="font-body text-white/90 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto relative group/btn z-10 space-y-4">
            {charities && charities.length > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-body text-xs text-gold-400 uppercase font-bold tracking-widest">Select Your Preferred Charity</label>
                  <select 
                    value={selectedCharity}
                    onChange={(e) => setSelectedCharity(e.target.value)}
                    className="w-full bg-navy-900 border border-gold-400/30 rounded-xl px-4 py-3 text-white font-body outline-none appearance-none cursor-pointer focus:border-gold-400"
                  >
                    <option value="">Default Distribution</option>
                    {charities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block font-body text-xs text-gold-400 uppercase font-bold tracking-widest">Charity Contribution (%)</label>
                    <span className="text-white text-xs font-bold">{charityPercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={charityPercentage} 
                    onChange={(e) => setCharityPercentage(parseInt(e.target.value))}
                    className="w-full accent-gold-400"
                  />
                  <p className="text-[10px] text-white/50 font-body uppercase tracking-widest text-right">Min: 10%</p>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute -inset-1 bg-gold-400/30 blur-xl rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              <Button 
                onClick={() => handleSubscribe('yearly')} 
                disabled={loading !== null}
                className="w-full h-14 btn-primary rounded-xl text-navy-950 font-body uppercase tracking-[0.2em] font-black border-none relative z-10"
              >
                {loading === 'yearly' ? 'Processing...' : 'Become a Legend'}
              </Button>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </>
  )
}
