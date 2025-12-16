import { useEffect, useRef } from 'react'

export const useCelebrate = () => {
  const containerRef = useRef(null)

  const celebrate = (type = 'success') => {
    if (!containerRef.current) return

    // Create celebration container
    const celebrationContainer = document.createElement('div')
    celebrationContainer.style.position = 'fixed'
    celebrationContainer.style.top = '0'
    celebrationContainer.style.left = '0'
    celebrationContainer.style.width = '100%'
    celebrationContainer.style.height = '100%'
    celebrationContainer.style.pointerEvents = 'none'
    celebrationContainer.style.zIndex = '9999'
    document.body.appendChild(celebrationContainer)

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
    
    if (type === 'success') {
      // Create confetti
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div')
        particle.style.position = 'absolute'
        particle.style.width = '10px'
        particle.style.height = '10px'
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        particle.style.left = Math.random() * 100 + '%'
        particle.style.top = '-10px'
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'
        celebrationContainer.appendChild(particle)

        // Simple CSS animation instead of animejs
        particle.style.animation = `fall ${3 + Math.random() * 2}s ease-out forwards`
        particle.style.transform = 'translateY(0)'
        
        setTimeout(() => {
          particle.style.transform = `translateY(${window.innerHeight + 100}px)`
          setTimeout(() => particle.remove(), 3000)
        }, 100)
      }
    } else if (type === 'balloons') {
      // Create balloons
      for (let i = 0; i < 15; i++) {
        const balloon = document.createElement('div')
        balloon.style.position = 'absolute'
        balloon.style.width = '40px'
        balloon.style.height = '50px'
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        balloon.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%'
        balloon.style.left = Math.random() * 100 + '%'
        balloon.style.bottom = '-60px'
        celebrationContainer.appendChild(balloon)

        // Add string
        const string = document.createElement('div')
        string.style.position = 'absolute'
        string.style.width = '1px'
        string.style.height = '60px'
        string.style.backgroundColor = '#666'
        string.style.left = '50%'
        string.style.bottom = '-60px'
        balloon.appendChild(string)

        // Simple CSS animation instead of animejs
        balloon.style.animation = `float ${4 + Math.random() * 2}s ease-in-out infinite`
        balloon.style.transform = 'translateY(0)'
        
        setTimeout(() => {
          balloon.style.transform = `translateY(-${window.innerHeight + 200}px)`
          setTimeout(() => balloon.remove(), 6000)
        }, 100)
      }
    }

    // Clean up
    setTimeout(() => {
      celebrationContainer.remove()
    }, 7000)
  }

  return { containerRef, celebrate }
}
