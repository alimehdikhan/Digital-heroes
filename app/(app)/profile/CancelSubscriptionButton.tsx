"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelSubscription } from "@/app/actions/subscription"
import { useToast } from "@/hooks/use-toast"

export function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You will lose access to score entry and draws at period end.')) return
    setLoading(true)
    const res = await cancelSubscription()
    setLoading(false)
    if (res.error) {
      toast({ title: 'Cancellation failed', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Subscription cancelled', description: 'Your subscription has been cancelled.' })
      window.location.reload()
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleCancel}
      className="h-12 px-8 border-red-400/40 text-red-400 hover:bg-red-400/10 uppercase tracking-widest text-xs font-bold"
    >
      {loading ? 'Cancelling...' : 'Cancel Subscription'}
    </Button>
  )
}
