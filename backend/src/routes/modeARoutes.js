const express = require('express')

const { analyzeVideo } = require('../controllers/modeAController')
const { protect } = require('../middleware/authMiddleware')
const { videoUpload } = require('../middleware/uploadMiddleware')

const router = express.Router()

router.use(protect)

router.post(
  '/courses/:courseId/lectures/analyze-video',
  videoUpload.single('video'),
  analyzeVideo,
)

module.exports = router
