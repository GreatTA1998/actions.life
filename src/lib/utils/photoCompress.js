import imageCompression from 'browser-image-compression'

export async function compressImage (file) {
  const options = {
    maxSizeMB: 1,         
    maxWidthOrHeight: 1920, 
    useWebWorker: true,     // Use web worker for performance
    quality: 0.8,          // JPEG quality (0.1 - 1.0)
    preserveExif: false,   // Remove EXIF for smaller size
  }
  
  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile

  } catch (error) {
    console.error('Compression failed:', error)
    return file
  }
}