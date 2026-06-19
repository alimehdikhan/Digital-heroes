'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadWinnerProof } from '@/app/actions/proofs'

export function WinnerProofUpload({ winnerId, drawMonth, drawYear }: { winnerId: string, drawMonth: string, drawYear: number }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('winnerId', winnerId)

    const result = await uploadWinnerProof(formData)
    
    setIsUploading(false)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to upload proof. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-emerald-400/10 border border-emerald-400/30 rounded-xl flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>
          <p className="text-emerald-400 font-bold font-display">Proof Submitted</p>
          <p className="text-emerald-400/70 text-xs font-body mt-1">Pending admin verification.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gold-400/10 border border-gold-400/30 rounded-xl space-y-3">
      <div className="flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 shrink-0"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"/><path d="M16 16l-4-4-4 4"/></svg>
        <div>
          <p className="text-gold-400 font-bold font-display">Action Required: Verify Win</p>
          <p className="text-gold-400/70 text-[10px] uppercase tracking-widest font-bold mt-1">Upload Golf Score Screenshot for {drawMonth} {drawYear}</p>
        </div>
      </div>
      
      {error && (
        <p className="text-red-400 text-xs font-body bg-red-400/10 p-2 rounded">{error}</p>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          id={`proof-${winnerId}`}
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <label
          htmlFor={`proof-${winnerId}`}
          className={`btn-primary w-full h-10 px-4 rounded flex items-center justify-center text-xs uppercase tracking-widest font-bold cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? 'Uploading...' : 'Upload Screenshot'}
        </label>
      </div>
    </div>
  )
}
