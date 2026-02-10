export function getMultiColorBgStyles (colors, styleName = 'dots') {
  if (styleName === 'dots') {
    return dotsPattern(colors)
  } else if (styleName === 'gradient') {
    return gradientPattern(colors)
  }
}

function dotsPattern (colors) {
  const dotSize = 12
  const spacing = 24
  const baseColor = 'white'
  
  const backgrounds = colors.map((color, index) => {
    const offsetX = (index % 3) * spacing
    const offsetY = Math.floor(index / 3) * spacing
    return `radial-gradient(circle at ${offsetX}px ${offsetY}px, ${color} ${dotSize / 2}px, transparent ${dotSize / 2}px)`
  })
  
  return {
    backgroundColor: baseColor,
    background: backgrounds.join(', '),
    backgroundSize: `${spacing * 3}px ${spacing * Math.ceil(colors.length / 3)}px`,
    backgroundRepeat: 'repeat'
  }
}

function gradientPattern (colors) {
  const gradientStops = colors.map((color, index) => {
    const position = (index / (colors.length - 1)) * 100
    return `${color} ${position}%`
  }).join(', ')
  
  return {
    background: `linear-gradient(to right, ${gradientStops})`
  }
}
