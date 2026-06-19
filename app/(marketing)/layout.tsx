import { MarketingNavbar } from "@/components/layout/MarketingNavbar"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-navy-950 overflow-hidden">
      <MarketingNavbar />
      <main className="flex-1 w-full relative">
        {/* Background ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none blur-[120px] bg-gradient-to-b from-navy-600 to-transparent rounded-full -z-10" />
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
