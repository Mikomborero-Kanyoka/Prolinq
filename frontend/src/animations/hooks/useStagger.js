import { useEffect, useRef, useState } from 'react'

export const useStagger = (itemCount = 0, staggerDelay = 100, animationDuration = 600) => {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const containerRef = useRef(null)
  const itemRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index)
            if (!isNaN(index)) {
              setTimeout(() => {
                setVisibleItems((prev) => new Set([...prev, index]))
              }, index * staggerDelay)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [itemCount, staggerDelay])

  const getItemRef = (index) => {
    return (el) => {
      itemRefs.current[index] = el
      if (el) {
        el.dataset.index = index
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        
        if (visibleItems.has(index)) {
          el.style.transition = `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      }
    }
  }

  useEffect(() => {
    itemRefs.current.forEach((ref, index) => {
      if (ref && visibleItems.has(index)) {
        ref.style.transition = `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`
        ref.style.opacity = '1'
        ref.style.transform = 'translateY(0)'
      }
    })
  }, [visibleItems, animationDuration])

  return { containerRef, getItemRef, visibleItems }
}
