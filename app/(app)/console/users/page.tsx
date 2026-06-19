import { SlideUp } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { getAdminUsers } from "@/app/actions/admin"
import { UsersTable } from "./UsersTable"

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <SlideUp className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">User Command</h1>
          <p className="text-white/70 font-body text-lg max-w-xl">Oversee the elite cohort of philanthropists and manage their hero status within the Digital Heroes ecosystem.</p>
        </div>
        <Button className="btn-primary px-8 h-12 uppercase tracking-widest font-black shadow-gold-glow border-none">
          Export Ledger
        </Button>
      </SlideUp>

      <UsersTable initialUsers={users} />
    </div>
  )
}
