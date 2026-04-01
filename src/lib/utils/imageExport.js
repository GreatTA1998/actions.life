import { DateTime } from 'luxon'

export async function shareEngravedImage (imageURL, dateISO, title) {
  try {
    // 1. Load the image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageURL
    })

    // 2. Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')

    // 3. Draw original image
    ctx.drawImage(img, 0, 0)

    // 4. Draw gradient overlay at the bottom
    const gradientHeight = img.height * 0.3
    const gradient = ctx.createLinearGradient(0, img.height - gradientHeight, 0, img.height)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, img.height - gradientHeight, img.width, gradientHeight)

    // 5. Draw Text
    // Font sizes relative to image size to maintain proportions roughly like the UI
    // PhotoGrid uses 1rem (approx 16px) for a container that is ~360px wide (minmax 360px).
    // 16/360 is approx 4.4%.
    const baseFontSize = Math.max(24, Math.round(img.width * 0.045)) 
    const padding = Math.round(img.width * 0.04) // 4% padding

    ctx.fillStyle = 'white'
    ctx.textBaseline = 'bottom' // Use bottom baseline for consistent alignment
    
    // Common Y position for both texts to ensure they align
    const textY = img.height - padding
    
    // Use consistent font weight for both title and date
    const fontWeight = 400 // Normal weight for consistency
    ctx.font = `${fontWeight} ${baseFontSize}px sans-serif`
    
    // Date (Right aligned)
    const dateText = dateISO ? DateTime.fromISO(dateISO).toFormat('MMM d, yyyy') : ''
    
    // Measure date width first (before setting font for title)
    ctx.textAlign = 'right'
    const dateWidth = dateText ? ctx.measureText(dateText).width : 0
    
    if (dateText) {
        ctx.fillText(dateText, img.width - padding, textY)
    }

    // Title (Left aligned)
    // We need to handle truncation if it overlaps with date, or just let it be long?
    // PhotoGrid truncates to one line.
    if (title) {
        ctx.textAlign = 'left'
        
        const maxTitleWidth = img.width - (2 * padding) - dateWidth - (padding / 2) // extra space between
        
        let textToDraw = title
        let textWidth = ctx.measureText(textToDraw).width
        
        // Simple truncation
        if (textWidth > maxTitleWidth) {
             // Iteratively shorten or just cut (iterative is better but slower, let's do approximation)
             // For now, let's just fit it.
             while (textWidth > maxTitleWidth && textToDraw.length > 0) {
                 textToDraw = textToDraw.slice(0, -1)
                 textWidth = ctx.measureText(textToDraw + '...').width
             }
             textToDraw += '...'
        }
        
        ctx.fillText(textToDraw, padding, textY)
    }

    // 6. Convert to Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

    if (!blob) throw new Error('Canvas to Blob failed')
    
    // 7. Share via Web Share API (works across all devices)
    if (!navigator.share) {
      throw new Error('Web Share API is not supported in this browser')
    }
    
    const file = new File([blob], `${title || 'photo'}.png`, { type: 'image/png' })
    
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      throw new Error('Cannot share this file')
    }
    
    await navigator.share({
      files: [file]
    })
    
    return true

  } catch (error) {
    console.error('Error sharing engraved image:', error)
    throw error
  }
}

