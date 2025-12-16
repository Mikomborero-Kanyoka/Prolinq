import { useEffect, useRef } from 'react'

export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * -speed
      element.style.transform = `translateY(${rate}px)`
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return elementRef
}
