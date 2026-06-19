'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { verifyProof } from '@/app/actions/admin'

export function ProofVerificationTable({ proofs }: { proofs: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const handleVerify = async (proofId: string, action: 'approve' | 'reject') => {
    setProcessingId(proofId)
    await verifyProof(proofId, action)
    setProcessingId(null)
  }

  if (proofs.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5 space-y-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>
          <p className="font-display text-2xl text-white/50 font-bold">No Pending Proofs</p>
          <p className="font-body text-sm text-white/30 mt-1">All winner submissions have been verified.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {proofs.map((proof) => (
        <div key={proof.id} className="glass-card p-6 rounded-2xl border border-gold-400/30 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-64 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/50 aspect-[4/3] flex items-center justify-center relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={proof.proof_url} 
              alt="Winner Proof" 
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <a href={proof.proof_url} target="_blank" rel="noopener noreferrer" className="btn-primary px-4 py-2 rounded text-xs uppercase tracking-widest font-bold">
                View Full Size
              </a>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-widest font-bold mb-1">
                  Draw: {proof.draws?.month} {proof.draws?.year}
                </p>
                <h4 className="font-display text-2xl text-white font-bold">{proof.profiles?.name || 'Unknown Hero'}</h4>
                <p className="text-white/70 font-body text-sm mt-1">Winnings: <span className="text-emerald-400 font-bold">${Number(proof.draw_winners?.amount).toLocaleString()}</span> ({proof.draw_winners?.tier})</p>
              </div>
              <div className="px-3 py-1 bg-gold-400/10 border border-gold-400/30 text-gold-400 text-[10px] uppercase tracking-widest font-bold rounded">
                Pending Review
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button 
                onClick={() => handleVerify(proof.id, 'approve')}
                disabled={processingId === proof.id}
                className="bg-emerald-400 text-navy-950 hover:bg-emerald-300 h-10 px-6 font-bold text-xs uppercase tracking-widest"
              >
                {processingId === proof.id ? 'Processing...' : 'Approve & Mark Paid'}
              </Button>
              <Button 
                onClick={() => handleVerify(proof.id, 'reject')}
                disabled={processingId === proof.id}
                variant="outline"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10 h-10 px-6 font-bold text-xs uppercase tracking-widest"
              >
                Reject Proof
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
