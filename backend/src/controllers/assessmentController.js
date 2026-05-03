const Assessment = require('../models/Assessment')
const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')
const { uploadBase64Image } = require('../services/cloudinaryService')

/**
 * POST /api/mode-b/assessments
 * Create a new assessment for the authenticated teacher.
 */
const createAssessment = asyncHandler(async (req, res) => {
  const { title, date, classroom, courseId } = req.body

  if (!title || !courseId) {
    throw createHttpError(400, 'Title and courseId are required.')
  }

  const assessment = await Assessment.create({
    teacher: req.teacher._id,
    course: courseId,
    title,
    date: date || '',
    classroom: classroom || '',
    status: 'ready',
  })

  res.status(201).json({ assessment })
})

/**
 * GET /api/mode-b/assessments
 * List all assessments for the authenticated teacher.
 */
const getAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ teacher: req.teacher._id })
    .sort({ createdAt: -1 })
    .lean()

  res.json({ assessments })
})

/**
 * GET /api/mode-b/assessments/:id
 * Get a single assessment by ID.
 */
const getAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    teacher: req.teacher._id,
  }).lean()

  if (!assessment) {
    throw createHttpError(404, 'Assessment not found.')
  }

  res.json({ assessment })
})

/**
 * POST /api/mode-b/assessments/:id/finalize
 * Finalize an assessment after monitoring stops.
 * Receives alerts[] with base64 evidenceImage fields.
 * Uploads each image to Cloudinary and saves detections.
 */
const finalizeAssessment = asyncHandler(async (req, res) => {
  const { alerts } = req.body

  const assessment = await Assessment.findOne({
    _id: req.params.id,
    teacher: req.teacher._id,
  })

  if (!assessment) {
    throw createHttpError(404, 'Assessment not found.')
  }

  if (assessment.status === 'completed') {
    return res.json({ assessment: assessment.toObject() })
  }

  const detections = []

  if (Array.isArray(alerts)) {
    for (const alert of alerts) {
      let imageUrl = ''

      if (alert.evidenceImage) {
        try {
          imageUrl = await uploadBase64Image(alert.evidenceImage)
        } catch (err) {
          console.error('Cloudinary upload failed for alert:', err.message)
          // Keep the base64 as fallback so data is not lost
          imageUrl = alert.evidenceImage
        }
      }

      detections.push({
        confidence: alert.confidence || 0,
        second: alert.second || 0,
        imageUrl,
        message: alert.message || '',
        time: alert.time || '',
      })
    }
  }

  assessment.status = 'completed'
  assessment.totalDetections = detections.length
  assessment.detections = detections
  await assessment.save()

  res.json({ assessment: assessment.toObject() })
})

module.exports = {
  createAssessment,
  getAssessments,
  getAssessment,
  finalizeAssessment,
}
