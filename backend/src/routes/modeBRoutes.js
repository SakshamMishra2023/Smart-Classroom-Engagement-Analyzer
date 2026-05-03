const express = require('express')

const { streamSimulation } = require('../controllers/modeBController')
const {
  createAssessment,
  getAssessments,
  getAssessment,
  finalizeAssessment,
} = require('../controllers/assessmentController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/simulation/stream', protect, streamSimulation)

router.use(protect)
router.route('/assessments').get(getAssessments).post(createAssessment)
router.route('/assessments/:id').get(getAssessment)
router.route('/assessments/:id/finalize').post(finalizeAssessment)

module.exports = router
