const fs = require('fs/promises')
const path = require('path')

const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')
const { extractFrames, cleanupFrames } = require('../services/videoFrameService')
const { analyzeFrame } = require('../services/roboflowService')
const { createZoomedDetectionImage } = require('../services/imageCropService')

const DEFAULT_VIDEO_PATH = path.join(__dirname, '../../simulation/mode-b-video.mp4')
const SIMULATION_DIR = path.join(__dirname, '../../simulation')
const CHEATING_CLASSES = ['4']  // 4 = phone detection

const streamSimulation = asyncHandler(async (req, res) => {
  // If `classroom` query param is present, use simulation/{classroom}.mp4
  const classroom = req.query.classroom
  const videoPath = classroom
    ? path.join(SIMULATION_DIR, `${classroom}.mp4`)
    : resolveSimulationVideoPath(process.env.MODE_B_VIDEO_PATH)

  await ensureVideoExists(videoPath)

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders?.()

  let clientClosed = false
  let extractedFrames = []

  req.on('close', () => {
    clientClosed = true
  })

  try {
    sendEvent(res, 'status', {
      status: 'started',
      message: `Mode B simulation started for ${path.basename(videoPath)}.`,
    })

    extractedFrames = await extractFrames(videoPath, process.env.MODE_B_MAX_SECONDS)

    for (const [index, frame] of extractedFrames.entries()) {
      if (clientClosed) break

      const result = await analyzeFrame(frame.path)
      const cheatingPrediction = (result.predictions || []).find(isCheatingPrediction)

      sendEvent(res, 'heartbeat', {
        second: frame.second || index + 1,
        frameIndex: index + 1,
        detections: result.predictions?.length || 0,
      })

      if (cheatingPrediction) {
        const evidenceImage = await createEvidenceImage(frame.path, cheatingPrediction)

        sendEvent(res, 'alert', {
          id: `${Date.now()}-${index}`,
          classId: cheatingPrediction.class_id ?? cheatingPrediction.classId,
          className: cheatingPrediction.class ?? cheatingPrediction.className,
          confidence: cheatingPrediction.confidence,
          frameIndex: index + 1,
          second: frame.second || index + 1,
          evidenceImage,
          message: `Cheating detected: ${getCheatingLabel(cheatingPrediction)} behavior found.`,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        })
      }

      await wait(Number(process.env.MODE_B_FRAME_DELAY_MS) || 1000)
    }

    if (!clientClosed) {
      sendEvent(res, 'status', {
        status: 'completed',
        message: 'Mode B simulation completed.',
      })
      res.end()
    }
  } finally {
    if (extractedFrames[0]?.path) {
      await cleanupFrames(extractedFrames[0].path).catch(() => {})
    }
  }
})

function resolveSimulationVideoPath(configuredPath) {
  if (!configuredPath) {
    return DEFAULT_VIDEO_PATH
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath
  }

  return path.join(__dirname, '../../', configuredPath)
}

async function ensureVideoExists(videoPath) {
  try {
    await fs.access(videoPath)
  } catch {
    throw createHttpError(
      404,
      `Mode B simulation video not found. Put a video at ${videoPath} or set MODE_B_VIDEO_PATH.`,
    )
  }
}

function isCheatingPrediction(prediction) {
  const className = prediction.class ?? prediction.className
  const classId = prediction.class_id ?? prediction.classId

  return CHEATING_CLASSES.includes(String(className)) || CHEATING_CLASSES.includes(String(classId))
}

function getCheatingLabel(prediction) {
  const classId = String(prediction.class_id ?? prediction.classId ?? prediction.class ?? prediction.className)
  const labels = { '4': 'Phone Detection' }
  return labels[classId] || `Class ${classId}`
}

async function createEvidenceImage(framePath, prediction) {
  try {
    return await createZoomedDetectionImage(framePath, prediction)
  } catch {
    const image = await fs.readFile(framePath, { encoding: 'base64' })
    return `data:image/jpeg;base64,${image}`
  }
}

function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

module.exports = { streamSimulation }
