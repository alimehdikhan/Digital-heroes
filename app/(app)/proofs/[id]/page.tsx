"use client"

import { useState } from "react"
import { FadeIn, SlideUp, ScaleIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { submitWinnerProof } from "@/app/actions/verification"

export default function SubmitProofPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('proofFile', file)
    formData.append('winnerId', params.id)
    
    const res = await submitWinnerProof({}, formData)
    
    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else if (res.success) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <ScaleIn>
          <div className="w-24 h-24 rounded-full bg-emerald-400/10 flex items-center justify-center border-2 border-emerald-400 shadow-emerald-glow mb-8 mx-auto">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Transmission Secure</h2>
          <p className="text-white/70 font-body text-lg max-w-lg mx-auto mb-8">Your proof has been successfully encrypted and submitted to the ledger. Awaiting validation.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="btn-primary px-8 h-12 uppercase tracking-widest font-black">Return to Arena</Button>
            </Link>
          </div>
        </ScaleIn>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-12">
      <SlideUp className="flex flex-col items-center text-center pt-8 mb-12">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="font-body text-[10px] uppercase font-bold tracking-widest">Secure Verification Protocol</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Submit Winner Proof</h1>
        <p className="text-white/70 font-body text-lg max-w-2xl mx-auto">Upload your digital proof to finalize your draw victory. Our encrypted ledger ensures your identity and scores are verified before payout.</p>
      </SlideUp>

      <FadeIn delay={0.2} className="max-w-4xl mx-auto">
        <div className="glass-card rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-400/5 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/5 blur-[100px] rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
                {error}
              </div>
            )}
            
            {/* File Upload Zone */}
            <div>
              <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest mb-3">Winning Scorecard Proof</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center ${isDragging ? 'border-emerald-400 bg-emerald-400/10 shadow-emerald-glow' : 'border-white/10 hover:border-emerald-400/50 bg-navy-900/50'}`}
              >
                <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-6 border border-emerald-400/30 group-hover:shadow-emerald-glow transition-shadow">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <h3 className="font-display text-2xl text-white font-bold mb-2">Secure Drop</h3>
                <p className="text-white/50 font-body text-center max-w-xs mb-6">
                  {file ? (
                    <span className="text-emerald-400 font-bold">{file.name}</span>
                  ) : (
                    <>Drag your digital scorecard file here, or <label className="text-emerald-400 font-bold cursor-pointer hover:underline">browse files<input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} /></label></>
                  )}
                </p>
                <div className="flex gap-4">
                  {['PNG', 'JPG', 'PDF'].map(ext => (
                    <span key={ext} className="px-3 py-1.5 bg-white/5 rounded-md font-body text-[10px] text-white/40 uppercase font-bold tracking-widest">{ext}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-lg flex items-center justify-center gap-3 btn-primary text-navy-950"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-navy-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ENCRYPTING & UPLOADING...
                  </>
                ) : (
                  <>
                    SUBMIT PROOF
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </>
                )}
              </Button>
              <p className="text-center mt-6 text-[10px] text-white/30 font-body uppercase tracking-[0.2em] font-bold">Verified by HeroShield™ Encryption</p>
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
