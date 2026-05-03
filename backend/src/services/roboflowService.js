const fs = require('fs/promises')

const axios = require('axios')

const createHttpError = require('../utils/httpError')

async function analyzeFrame(framePath) {
  const apiKey = process.env.ROBOFLOW_API_KEY
  const modelUrl =
    process.env.ROBOFLOW_MODEL_URL ||
    'https://serverless.roboflow.com/student-behaviour-detection-neazg/1'

  if (!apiKey) {
    throw createHttpError(500, 'ROBOFLOW_API_KEY is missing on the server.')
  }

  const image = await fs.readFile(framePath, { encoding: 'base64' })

  const response = await axios({
    method: 'POST',
    url: modelUrl,
    params: {
      api_key: apiKey,
    },
    data: image,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: Number(process.env.ROBOFLOW_TIMEOUT_MS) || 30000,
  })

  return response.data
}

module.exports = { analyzeFrame }
