"use client"

import Lenis from "lenis"
import { useEffect } from "react"

interface LenisInstance {
  raf: (time: number) => void
  destroy: () => void
}

interface LenisOptions {
  duration?: number
  easing?: (t: number) => number
  direction?: "vertical" | "horizontal"
  gestureDirection?: "vertical" | "horizontal"
  orientation?: "vertical" | "horizontal"
  smooth?: boolean
  smoothTouch?: boolean
  smoothWheel?: boolean
  touchMultiplier?: number
  wheelMultiplier?: number
}

export default function LenisProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lenis: LenisInstance = new Lenis({
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1.1,
      orientation: "vertical",
      smoothWheel: true,
    } as LenisOptions)

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
