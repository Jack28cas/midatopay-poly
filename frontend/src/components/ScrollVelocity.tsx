'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion'
import './ScrollVelocity.css'

type AutoScrollProps = {
  children?: React.ReactNode
  velocity?: number
  className?: string
  parallaxClassName?: string
  scrollerClassName?: string
  parallaxStyle?: React.CSSProperties
  scrollerStyle?: React.CSSProperties
}

export default function ScrollVelocity({
  children,
  velocity = 20,
  className = '',
  parallaxClassName = 'parallax',
  scrollerClassName = 'scroller',
  parallaxStyle,
  scrollerStyle
}: AutoScrollProps) {
  const baseX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(true)

  // Memoizar el contenido duplicado para evitar recreaciones
  const duplicatedContent = useMemo(() => {
    return (
      <>
        {children}
        {children}
        {children}
        {children}
      </>
    )
  }, [children])

  // Optimizar el cálculo del movimiento
  useAnimationFrame((_, delta) => {
    if (!isVisibleRef.current) return
    
    // Limitar el delta para evitar saltos grandes
    const clampedDelta = Math.min(delta, 100) // Máximo 100ms entre frames
    const moveBy = velocity * (clampedDelta / 1000)
    const currentX = baseX.get()
    
    // Movimiento continuo hacia la izquierda
    let newX = currentX - moveBy
    
    // Reset cuando llega a -25% (una copia completa, ya que tenemos 4 copias)
    if (newX <= -25) {
      newX = newX + 25
    }
    
    baseX.set(newX)
  })

  // Pausar animación cuando el elemento no está visible (Intersection Observer)
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting
        })
      },
      { threshold: 0 }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  const x = useTransform(baseX, v => `${v}%`)

  return (
    <div 
      className={parallaxClassName} 
      style={{
        ...parallaxStyle,
        willChange: 'transform', // Optimización CSS
        contain: 'layout style paint' // Optimización CSS
      }}
    >
      <motion.div 
        className={scrollerClassName} 
        style={{
          x,
          ...scrollerStyle,
          willChange: 'transform', // Optimización CSS
          backfaceVisibility: 'hidden', // Optimización CSS
          WebkitBackfaceVisibility: 'hidden'
        }}
        ref={containerRef}
      >
        {duplicatedContent}
      </motion.div>
    </div>
  )
}