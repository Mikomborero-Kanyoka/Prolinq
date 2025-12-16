import anime from 'animejs'

export const animateButtonClick = (element) => {
  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: 150,
    easing: 'easeOutQuad'
  })
}

export const animateHover = (element) => {
  anime({
    targets: element,
    scale: 1.05,
    duration: 200,
    easing: 'easeOutQuad'
  })
}

export const animateLeave = (element) => {
  anime({
    targets: element,
    scale: 1,
    duration: 200,
    easing: 'easeOutQuad'
  })
}

export const animatePulse = (element) => {
  anime({
    targets: element,
    scale: [1, 1.1, 1],
    duration: 500,
    easing: 'easeInOutQuad',
    loop: true
  })
}