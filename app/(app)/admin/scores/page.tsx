import { SlideUp } from "@/components/ui/motion"
import { getAdminScores } from "@/app/actions/admin"
import { ScoresTable } from "./ScoresTable"

export default async function AdminScoresPage() {
  const scores = await getAdminScores()

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Score Ledger</h1>
          <p className="text-white/70 font-body text-lg max-w-xl">Global oversight of all Hero transmissions. Monitor integrity and securely invalidate fraudulent metrics.</p>
        </div>
      </SlideUp>

      <ScoresTable initialScores={scores as any} />
    </div>
  )
}
