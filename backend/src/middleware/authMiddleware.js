const jwt = require('jsonwebtoken')

const Teacher = require('../models/Teacher')
const createHttpError = require('../utils/httpError')
const asyncHandler = require('./asyncHandler')

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, headerToken] = authHeader.split(' ')
  const token = headerToken || req.query.token

  if ((!headerToken || scheme !== 'Bearer') && !req.query.token) {
    throw createHttpError(401, 'Authentication token is required.')
  }

  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'JWT_SECRET is missing on the server.')
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET)
  const teacher = await Teacher.findById(payload.teacherId)

  if (!teacher) {
    throw createHttpError(401, 'Teacher account no longer exists.')
  }

  req.teacher = teacher
  next()
})

module.exports = { protect }
