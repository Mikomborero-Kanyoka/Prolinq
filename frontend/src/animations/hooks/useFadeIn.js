import { useEffect, useRef } from 'react'

export const useFadeIn = (duration = 1000, delay = 0) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'

    const timer = setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, delay)

    return () => clearTimeout(timer)
  }, [duration, delay])

  return elementRef
}
