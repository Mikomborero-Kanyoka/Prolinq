import { useEffect, useRef } from 'react'

export const useSlideUp = (duration = 800, delay = 0, distance = 50) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state
    element.style.opacity = '0'
    element.style.transform = `translateY(${distance}px)`

    const timer = setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, delay)

    return () => clearTimeout(timer)
  }, [duration, delay, distance])

  return elementRef
}
