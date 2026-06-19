"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-navy-950/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="section-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gold-gradient shadow-gold-glow flex items-center justify-center text-navy-950 font-black font-display tracking-tighter transition-transform group-hover:scale-105">
              DH
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white transition-colors group-hover:text-gold-400">
              Digital Heroes
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/charities" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Charities
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gold-gradient text-navy-950 hover:shadow-gold-glow font-bold border-none transition-all hover:scale-105">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-gold-400 hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gold-gradient text-navy-950 hover:shadow-gold-glow font-bold border-none transition-all hover:scale-105">
                    Be a Hero
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-navy-900 border-b border-white/10"
        >
          <div className="px-4 py-6 flex flex-col gap-4">
            <Link href="/#how-it-works" className="text-white/80 hover:text-white font-medium p-2" onClick={() => setMobileMenuOpen(false)}>
              How it Works
            </Link>
            <Link href="/charities" className="text-white/80 hover:text-white font-medium p-2" onClick={() => setMobileMenuOpen(false)}>
              Charities
            </Link>
            <Link href="/pricing" className="text-white/80 hover:text-white font-medium p-2" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <hr className="border-white/10 my-2" />
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gold-gradient text-navy-950 font-bold border-none">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gold-gradient text-navy-950 font-bold border-none">
                    Be a Hero
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
