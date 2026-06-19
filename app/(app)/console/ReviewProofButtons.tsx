"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { reviewWinnerProof } from "@/app/actions/verification"
import { useToast } from "@/hooks/use-toast"

export function ReviewProofButtons({ proofId }: { proofId: string }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleReview = async (status: 'approved' | 'rejected') => {
    setIsProcessing(true)
    try {
      await reviewWinnerProof(proofId, status, status === 'rejected' ? 'Proof rejected by admin' : undefined)
      toast({
        title: status === 'approved' ? "Proof Approved" : "Proof Rejected",
        description: `Winner payout status updated to ${status}.`,
        variant: status === 'approved' ? "default" : "destructive",
      })
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update proof status.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-3 w-full sm:w-auto">
      <Button 
        variant="outline" 
        size="sm" 
        disabled={isProcessing}
        onClick={() => handleReview('rejected')}
        className="flex-1 sm:flex-none h-10 px-6 border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest bg-transparent"
      >
        Reject
      </Button>
      <Button 
        size="sm" 
        disabled={isProcessing}
        onClick={() => handleReview('approved')}
        className="flex-1 sm:flex-none h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest border-none"
      >
        Approve
      </Button>
    </div>
  )
}
