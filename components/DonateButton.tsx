'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createDonationOrder } from '@/app/actions/donations'
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

const presetAmounts = [500, 1000, 2500, 5000, 10000]

export function DonateButton({ charityId, charityName }: { charityId: string; charityName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const effectiveAmount = customAmount ? parseInt(customAmount) : amount

  const handleDonate = async () => {
    if (!effectiveAmount || effectiveAmount < 100) {
      setError('Minimum donation is ₹100')
      return
    }

    setIsProcessing(true)
    setError(null)

    const result = await createDonationOrder(charityId, effectiveAmount * 100) // Convert to paise

    if (result.error) {
      setError(result.error)
      setIsProcessing(false)
      return
    }

    // Load Razorpay checkout
    const options = {
      key: result.keyId,
      amount: result.amount,
      currency: 'INR',
      name: 'Digital Heroes',
      description: `Donation to ${result.charityName}`,
      order_id: result.orderId,
      handler: async (response: any) => {
        toast({
          title: "Payment Successful",
          description: "Thank you for your generous donation!",
        })
        setSuccess(true)
        setIsProcessing(false)
      },
      prefill: {},
      theme: {
        color: '#10b981',
        backdrop_color: '#0a0e1a'
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSuccess(false)}>
        <div className="glass-card p-10 rounded-3xl max-w-md w-full text-center space-y-6 border border-emerald-400/30" onClick={e => e.stopPropagation()}>
          <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto border border-emerald-400/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 className="font-display text-3xl text-white font-bold">Thank You, Hero</h3>
          <p className="text-white/70 font-body">Your ₹{effectiveAmount.toLocaleString()} donation to <span className="text-emerald-400 font-bold">{charityName}</span> has been received. You are making a real difference.</p>
          <Button onClick={() => { setSuccess(false); setIsOpen(false) }} className="btn-primary w-full h-12 uppercase tracking-widest font-bold text-navy-950">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        size="lg" 
        variant="outline" 
        className="h-16 px-12 border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 uppercase tracking-widest font-black bg-transparent"
      >
        Independent Donation
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="glass-card p-8 rounded-3xl max-w-lg w-full space-y-8 border border-white/10 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Header */}
            <div className="space-y-2">
              <span className="font-body text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">Independent Donation</span>
              <h3 className="font-display text-3xl text-white font-bold">Support {charityName}</h3>
              <p className="text-white/50 font-body text-sm">Make a one-time donation. No subscription required.</p>
            </div>

            {/* Preset amounts */}
            <div className="space-y-3">
              <label className="font-body text-xs text-white/50 uppercase tracking-widest font-bold block">Select Amount (₹)</label>
              <div className="grid grid-cols-5 gap-3">
                {presetAmounts.map(a => (
                  <button 
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount('') }}
                    className={`py-3 rounded-xl font-display text-lg font-bold transition-all border ${
                      !customAmount && amount === a 
                        ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {a >= 1000 ? `${a/1000}k` : a}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <label className="font-body text-xs text-white/50 uppercase tracking-widest font-bold block">Or Enter Custom Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-display text-lg font-bold">₹</span>
                <input 
                  type="number"
                  min="100"
                  max="100000"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-navy-900 border border-white/20 rounded-xl pl-10 pr-4 py-4 text-white font-display text-lg font-bold focus:border-emerald-400/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-body bg-red-400/10 p-3 rounded-lg border border-red-400/30">{error}</p>
            )}

            {/* Summary & CTA */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-white/50">Donation Total</span>
                <span className="font-display text-3xl text-emerald-400 font-bold">₹{effectiveAmount.toLocaleString()}</span>
              </div>
              <Button 
                onClick={handleDonate}
                disabled={isProcessing}
                className="btn-primary w-full h-14 uppercase tracking-widest font-black text-navy-950 text-sm"
              >
                {isProcessing ? 'Processing...' : 'Donate Now'}
              </Button>
              <p className="text-white/30 text-[10px] text-center font-body">Secure payment via Razorpay. 100% of your donation goes to the charity.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
