// Solid-background ("color key") removal that runs entirely on a canvas.
// Ideal for logos, graphics, text, or screenshots that sit on a uniform
// background color (e.g. the black-background logo in past sessions).

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

// Average the four corner pixels to estimate the background color.
function detectBackgroundColor(data, width, height) {
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]
  let r = 0
  let g = 0
  let b = 0
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  return { r: r / 4, g: g / 4, b: b / 4 }
}

/**
 * Remove a solid background color from an image.
 * @param {File|Blob} file - source image
 * @param {object} opts
 * @param {number} opts.tolerance - 0..255 color distance treated as fully background
 * @param {number} opts.softness - extra distance over which alpha fades in (anti-aliasing)
 * @param {{r:number,g:number,b:number}} [opts.bgColor] - override auto-detected color
 * @returns {Promise<Blob>} PNG blob with transparency
 */
export async function removeColorBackground(file, opts = {}) {
  const tolerance = opts.tolerance ?? 40
  const softness = opts.softness ?? 30

  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const bg = opts.bgColor ?? detectBackgroundColor(data, canvas.width, canvas.height)

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - bg.r
    const dg = data[i + 1] - bg.g
    const db = data[i + 2] - bg.b
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)

    if (dist <= tolerance) {
      data[i + 3] = 0
    } else if (dist <= tolerance + softness) {
      // Smooth alpha ramp across the soft edge band.
      const t = (dist - tolerance) / softness
      data[i + 3] = Math.round(data[i + 3] * t)
    }
    // else: keep original alpha
  }

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export image.'))
    }, 'image/png')
  })
}

export { detectBackgroundColor }
