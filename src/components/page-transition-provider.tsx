"use client"

import { ReactNode } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'

interface PageTransitionProviderProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
