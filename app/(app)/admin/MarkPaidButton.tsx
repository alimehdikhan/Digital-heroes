"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { markWinnerPaid } from "@/app/actions/verification"
import { useToast } from "@/hooks/use-toast"

export function MarkPaidButton({ winnerId }: { winnerId: string }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleMarkPaid = async () => {
    setIsProcessing(true)
    try {
      await markWinnerPaid(winnerId)
      toast({
        title: "Payout Completed",
        description: `Winner payout status updated to Paid.`,
      })
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update payout status.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button 
      size="sm" 
      disabled={isProcessing}
      onClick={handleMarkPaid}
      className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest border-none"
    >
      Mark Paid
    </Button>
  )
}
