export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-navy-950 px-4 md:px-20 relative overflow-hidden text-white">
      {/* Fine grain overlay for cinematic texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuEENfvP2dWBsVEC-l157egaBBJTn74GLks19F2WTrXVUex2iPV8azPWfkH9Jr_IigGN_nPWtcfUg2VRHrm0tGvQx0n3ExQzjtH86d0qNLQkfPDqpTYTShyDaSqqpE188PIx-WVAbzupJdPzQId84vIrWtK9PVuU5ym78slwQRP549fzNQNJ-ZZwC0i_D6dYUDqp5cTgbsogJP1GJhCj410oKODY3G1oDON-qHEv8733JQcV7xRoJPCVXmiMC1wUFEFlcMu5y6bg')] bg-repeat" />
      
      {/* Global Decoration Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <main className="relative z-10 w-full max-w-[480px]">
        {children}
      </main>
    </div>
  )
}
