export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image:HTMLImageElement = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })


/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc,
  pixelCropOrRatio,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc) as HTMLImageElement
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }


  // calculate bounding box
  const { width: bBoxWidth, height: bBoxHeight } = image

  // set canvas size to match the bounding box
  canvas.width = image.width
  canvas.height = image.height


  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')

  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  let pixelCrop = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
  if (pixelCropOrRatio.aspectRatio) {
    const imageRatio = image.width / image.height
    if (imageRatio > pixelCropOrRatio.aspectRatio) {
      pixelCrop.height = image.height
      pixelCrop.width = Math.round(image.height * pixelCropOrRatio.aspectRatio)
      pixelCrop.x = Math.round((image.width - pixelCrop.width) / 2)
    } else {
      pixelCrop.width = image.width
      pixelCrop.height = Math.round(image.width / pixelCropOrRatio.aspectRatio)
      pixelCrop.y = Math.round((image.height - pixelCrop.height) / 2)
    }
  } else {
    pixelCrop = pixelCropOrRatio
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      resolve(URL.createObjectURL(file))
    }, 'image/png')
  })
}

