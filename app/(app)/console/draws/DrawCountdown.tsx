"use client"

import { useState, useEffect } from "react"

export function DrawCountdown() {
  const [countdown, setCountdown] = useState("02:14:08")

  useEffect(() => {
    let time = 8048
    const timer = setInterval(() => {
      time--
      const h = Math.floor(time / 3600)
      const m = Math.floor((time % 3600) / 60)
      const s = time % 60
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="font-display text-4xl text-emerald-400 font-bold tracking-widest">{countdown}</div>
  )
}
