const path = require('path')

const multer = require('multer')

const uploadDirectory = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDirectory)
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('video/')) {
      const error = new Error('Only video uploads are supported for Mode A analysis.')
      error.statusCode = 400
      cb(error)
      return
    }

    cb(null, true)
  },
})

module.exports = { videoUpload }
