const fs = require('fs/promises')

const Course = require('../models/Course')
const Lecture = require('../models/Lecture')
const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')
const { findOwnedCourse } = require('../utils/courseAccess')
const { extractFrames, cleanupFrames } = require('../services/videoFrameService')
const { analyzeFrame } = require('../services/roboflowService')
const { aggregateFrameDetections } = require('../services/detectionAggregator')

const analyzeVideo = asyncHandler(async (req, res) => {
  const course = await findOwnedCourse(req.params.courseId, req.teacher._id)

  if (!req.file) {
    throw createHttpError(400, 'A video file is required in the "video" field.')
  }

  const uploadedVideoPath = req.file.path
  let extractedFrames = []

  try {
    extractedFrames = await extractFrames(uploadedVideoPath, process.env.MAX_VIDEO_SECONDS)

    if (extractedFrames.length === 0) {
      throw createHttpError(422, 'No frames could be extracted from this video.')
    }

    const frameResults = await Promise.all(
      extractedFrames.map(async (frame) => {
        const roboflowResponse = await analyzeFrame(frame.path)

        return {
          predictions: roboflowResponse.predictions || [],
        }
      }),
    )

    const analysis = aggregateFrameDetections(frameResults)
    const lecture = await Lecture.create({
      teacher: req.teacher._id,
      course: course._id,
      title: req.body.title || req.body.lectureTitle || 'Mode A lecture analysis',
      lectureDate: req.body.lectureDate || Date.now(),
      section: req.body.section,
      notes: req.body.notes,
      mode: 'mode-a',
      source: {
        videoOriginalName: req.file.originalname,
        videoMimeType: req.file.mimetype,
        videoSizeBytes: req.file.size,
      },
      model: {
        provider: 'roboflow',
        url:
          process.env.ROBOFLOW_MODEL_URL ||
          'https://serverless.roboflow.com/student-behaviour-detection-neazg/1',
      },
      ...analysis,
    })

    await Course.findByIdAndUpdate(course._id, {
      $addToSet: { lectures: lecture._id },
    })

    res.status(201).json({
      lectureId: lecture._id,
      courseId: course._id,
      summary: {
        frameCount: lecture.frameCount,
        totalDetections: lecture.totalDetections,
        classCounts: mapToObject(lecture.classCounts),
        classSummaries: lecture.classSummaries,
      },
      lecture,
    })
  } finally {
    await fs.rm(uploadedVideoPath, { force: true }).catch(() => {})

    if (extractedFrames[0]?.path) {
      await cleanupFrames(extractedFrames[0].path).catch(() => {})
    }
  }
})

function mapToObject(value) {
  if (!value) return {}
  if (value instanceof Map) return Object.fromEntries(value.entries())
  return value
}

module.exports = { analyzeVideo }
