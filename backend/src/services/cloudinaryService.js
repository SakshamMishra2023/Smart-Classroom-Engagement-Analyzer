const cloudinary = require('cloudinary').v2

function ensureConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not set.')
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

/**
 * Upload a base64 data URI (e.g. "data:image/jpeg;base64,...") to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
async function uploadBase64Image(base64DataUri) {
  ensureConfigured()

  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder: 'classroom-vision/evidence',
    resource_type: 'image',
  })

  return result.secure_url
}

module.exports = { uploadBase64Image }
