const fs = require('fs/promises')
const path = require('path')
const { spawn } = require('child_process')

const createHttpError = require('../utils/httpError')

// Box‑drawing color & thickness for the detection highlight
const BOX_COLOR = 'red@0.85'
const BOX_THICKNESS = 4

async function createZoomedDetectionImage(framePath, prediction) {
  const dimensions = await getImageDimensions(framePath)
  const crop = getCropBox(prediction, dimensions)
  const detectionBox = getDetectionBoxInCrop(prediction, crop)
  const outputPath = path.join(
    path.dirname(framePath),
    `alert-${Date.now()}-${Math.round(Math.random() * 10000)}.jpg`,
  )

  // Crop → draw bounding‑box rectangle → upscale to 960px wide
  const filterChain = [
    `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    `drawbox=x=${detectionBox.x}:y=${detectionBox.y}:w=${detectionBox.width}:h=${detectionBox.height}:color=${BOX_COLOR}:t=${BOX_THICKNESS}`,
    'scale=960:-1',
  ].join(',')

  await runProcess(getFfmpegPath(), ['-y', '-i', framePath, '-vf', filterChain, outputPath])

  const image = await fs.readFile(outputPath, { encoding: 'base64' })
  await fs.rm(outputPath, { force: true }).catch(() => {})

  return `data:image/jpeg;base64,${image}`
}

async function getImageDimensions(imagePath) {
  const output = await runProcess(getFfprobePath(), [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=s=x:p=0',
    imagePath,
  ])
  const [width, height] = output
    .trim()
    .split('x')
    .map((value) => Number(value))

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw createHttpError(500, 'Could not read extracted frame dimensions.')
  }

  return { width, height }
}

/**
 * Compute a crop region centred on the detection but ~3× larger so the
 * person and surrounding context are clearly visible.
 */
function getCropBox(prediction, dimensions) {
  const centerX = Number(prediction.x) || dimensions.width / 2
  const centerY = Number(prediction.y) || dimensions.height / 2
  const rawWidth = Number(prediction.width) || dimensions.width / 3
  const rawHeight = Number(prediction.height) || dimensions.height / 3
  const cropWidth = Math.min(dimensions.width, Math.max(200, Math.round(rawWidth * 3.0)))
  const cropHeight = Math.min(dimensions.height, Math.max(200, Math.round(rawHeight * 3.0)))
  const x = clamp(Math.round(centerX - cropWidth / 2), 0, dimensions.width - cropWidth)
  const y = clamp(Math.round(centerY - cropHeight / 2), 0, dimensions.height - cropHeight)

  return { x, y, width: cropWidth, height: cropHeight }
}

/**
 * Map the original detection bbox into the coordinate space of the crop so
 * ffmpeg's drawbox filter highlights the right area.
 */
function getDetectionBoxInCrop(prediction, crop) {
  const halfW = (Number(prediction.width) || 0) / 2
  const halfH = (Number(prediction.height) || 0) / 2
  const predLeft = (Number(prediction.x) || 0) - halfW
  const predTop = (Number(prediction.y) || 0) - halfH

  return {
    x: Math.max(0, Math.round(predLeft - crop.x)),
    y: Math.max(0, Math.round(predTop - crop.y)),
    width: Math.round(Number(prediction.width) || crop.width / 3),
    height: Math.round(Number(prediction.height) || crop.height / 3),
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function getFfmpegPath() {
  return process.env.FFMPEG_PATH || getOptionalPackagePath('ffmpeg-static') || 'ffmpeg'
}

function getFfprobePath() {
  if (process.env.FFPROBE_PATH) {
    return process.env.FFPROBE_PATH
  }

  const ffprobeStatic = getOptionalPackagePath('ffprobe-static')

  if (typeof ffprobeStatic === 'string') {
    return ffprobeStatic
  }

  return 'ffprobe'
}

function getOptionalPackagePath(packageName) {
  try {
    const imported = require(packageName)
    return typeof imported === 'string' ? imported : imported.path
  } catch {
    return null
  }
}

function runProcess(command, args) {
  if (!command) {
    throw createHttpError(500, 'ffmpeg is not configured on the server.')
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      reject(createHttpError(500, `Failed to run ${path.basename(command)}: ${error.message}`))
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }

      reject(
        createHttpError(
          500,
          `${path.basename(command)} failed with exit code ${code}: ${stderr.slice(0, 500)}`,
        ),
      )
    })
  })
}

module.exports = { createZoomedDetectionImage }
