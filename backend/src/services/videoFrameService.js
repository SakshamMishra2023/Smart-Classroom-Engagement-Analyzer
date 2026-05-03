const fs = require('fs/promises')
const path = require('path')
const { randomUUID } = require('crypto')
const { spawn } = require('child_process')

const createHttpError = require('../utils/httpError')

const framesRoot = path.join(__dirname, '../../tmp/frames')

async function extractFrames(videoPath, maxSeconds) {
  const frameLimit = Number(maxSeconds) > 0 ? Math.floor(Number(maxSeconds)) : null
  const requestId = randomUUID()
  const outputDirectory = path.join(framesRoot, requestId)

  await fs.mkdir(outputDirectory, { recursive: true })

  try {
    const filter = buildFrameFilter()
    const outputPattern = path.join(outputDirectory, 'frame-%03d.jpg')
    const args = [
      '-y',
      '-i',
      videoPath,
      '-vf',
      filter,
      outputPattern,
    ]

    if (frameLimit) {
      args.splice(args.length - 1, 0, '-frames:v', String(frameLimit))
    }

    await runProcess(getFfmpegPath(), args)

    const files = await fs.readdir(outputDirectory)
    const frames = files
      .filter((file) => file.toLowerCase().endsWith('.jpg'))
      .sort()
      .map((file, index) => ({
        imageName: file,
        path: path.join(outputDirectory, file),
        second: index + 1,
      }))

    if (frames.length === 0) {
      await fs.rm(outputDirectory, { recursive: true, force: true })
    }

    return frames
  } catch (error) {
    await fs.rm(outputDirectory, { recursive: true, force: true })
    throw error
  }
}

async function cleanupFrames(framePath) {
  if (!framePath) return

  await fs.rm(path.dirname(framePath), { recursive: true, force: true })
}

function buildFrameFilter() {
  return 'fps=1,scale=960:-1'
}

function getFfmpegPath() {
  return process.env.FFMPEG_PATH || getOptionalPackagePath('ffmpeg-static') || 'ffmpeg'
}

function getOptionalPackagePath(packageName) {
  try {
    const imported = require(packageName)
    return typeof imported === 'string' ? imported : imported.path
  } catch (error) {
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

module.exports = { extractFrames, cleanupFrames }
