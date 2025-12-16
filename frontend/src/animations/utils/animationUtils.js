// Using CSS animations instead of animejs to avoid import issues

export const animateButton = (element, options = {}) => {
  const defaults = {
    scale: 1.1,
    duration: 200,
    easing: 'easeOutQuad'
  }
  
  anime({
    targets: element,
    ...defaults,
    ...options,
    complete: () => {
      anime({
        targets: element,
        scale: 1,
        duration: 200,
        easing: 'easeInQuad'
      })
    }
  })
}

export const animateIcon = (element, type = 'bounce') => {
  const animations = {
    bounce: {
      translateY: [-10, 0],
      duration: 600,
      easing: 'easeOutBounce'
    },
    spin: {
      rotate: 360,
      duration: 600,
      easing: 'easeInOutQuad'
    },
    pulse: {
      scale: [1, 1.2, 1],
      duration: 600,
      easing: 'easeInOutQuad'
    }
  }

  anime({
    targets: element,
    ...animations[type]
  })
}

export const createCountUp = (element, target, duration = 2000) => {
  anime({
    targets: element,
    innerHTML: [0, target],
    duration: duration,
    easing: 'easeOutExpo',
    round: 1
  })
}

export const staggeredAnimation = (elements, options = {}) => {
  const defaults = {
    translateY: [30, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 600,
    easing: 'easeOutQuad'
  }

  anime({
    targets: elements,
    ...defaults,
    ...options
  })
}

export const slideInFromLeft = (elements, delay = 0) => {
  anime({
    targets: elements,
    translateX: [-50, 0],
    opacity: [0, 1],
    delay: delay,
    duration: 800,
    easing: 'easeOutQuad'
  })
}

export const slideInFromRight = (elements, delay = 0) => {
  anime({
    targets: elements,
    translateX: [50, 0],
    opacity: [0, 1],
    delay: delay,
    duration: 800,
    easing: 'easeOutQuad'
  })
}

export const fadeInScale = (elements, delay = 0) => {
  anime({
    targets: elements,
    scale: [0.8, 1],
    opacity: [0, 1],
    delay: delay,
    duration: 600,
    easing: 'easeOutQuad'
  })
}

export const createTypewriterEffect = (element, text, speed = 50) => {
  element.textContent = ''
  let index = 0

  const typeChar = () => {
    if (index < text.length) {
      element.textContent += text[index]
      index++
      setTimeout(typeChar, speed)
    }
  }

  typeChar()
}

export const createMorphAnimation = (element, shapes, duration = 2000) => {
  let currentShape = 0

  const morph = () => {
    anime({
      targets: element,
      borderRadius: shapes[currentShape],
      duration: duration,
      easing: 'easeInOutQuad',
      complete: () => {
        currentShape = (currentShape + 1) % shapes.length
        morph()
      }
    })
  }

  morph()
}
