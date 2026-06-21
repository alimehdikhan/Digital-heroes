import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'

export default async function DrawHistoryPage() {
  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select(`
      id, month, year, winning_numbers, total_pool, jackpot_amount,
      jackpot_rolled_over, participant_count, status, created_at,
      draw_winners ( tier, amount, payout_status, profiles ( name ) )
    `)
    .eq('status', 'completed')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return (
    <div className="py-24 px-5 md:px-20 max-w-6xl mx-auto space-y-12">
      <SlideUp className="text-center space-y-4">
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold">Draw History & Winners</h1>
        <p className="text-white/60 font-body max-w-2xl mx-auto">
          Published monthly draw results. Match 3, 4, or 5 Stableford scores to win tier prizes.
        </p>
        <Link href="/register">
          <Button className="btn-primary mt-4">Join the Next Draw</Button>
        </Link>
      </SlideUp>

      <StaggerContainer className="space-y-6">
        {!draws?.length && (
          <div className="glass-card p-12 text-center text-white/50 rounded-2xl">No published draws yet.</div>
        )}
        {draws?.map((draw) => (
          <StaggerItem key={draw.id} className="glass-card rounded-2xl p-8 border border-white/10 space-y-6">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h2 className="font-display text-2xl text-white font-bold">
                  {draw.month}/{draw.year} Draw
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  {draw.participant_count} participants • Pool ₹{Number(draw.total_pool).toLocaleString()}
                </p>
              </div>
              {draw.jackpot_rolled_over && (
                <span className="text-gold-400 text-xs uppercase font-bold tracking-widest border border-gold-400/30 px-3 py-1 rounded-full">
                  Jackpot Rolled Over
                </span>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-3">Winning Numbers</p>
              <div className="flex gap-3 flex-wrap">
                {(draw.winning_numbers as number[]).map((num) => (
                  <div key={num} className="w-12 h-12 rounded-full border border-gold-400/50 flex items-center justify-center font-display text-lg text-gold-400 bg-gold-400/5 font-bold">
                    {String(num).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {draw.draw_winners && draw.draw_winners.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Winners</p>
                <ul className="divide-y divide-white/5">
                  {draw.draw_winners.map((w: any, i: number) => (
                    <li key={i} className="py-3 flex justify-between text-sm">
                      <span className="text-white">{w.profiles?.name || 'Hero'} — {w.tier}</span>
                      <span className="text-emerald-400 font-bold">₹{Number(w.amount).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-white/40 text-sm italic">No tier winners this month.</p>
            )}
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn className="text-center">
        <Link href="/" className="text-gold-400 text-sm hover:underline">← Back to Home</Link>
      </FadeIn>
    </div>
  )
}
