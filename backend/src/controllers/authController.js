const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Teacher = require('../models/Teacher')
const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw createHttpError(400, 'Name, email, and password are required.')
  }

  if (password.length < 6) {
    throw createHttpError(400, 'Password must be at least 6 characters long.')
  }

  const existingTeacher = await Teacher.findOne({ email: email.toLowerCase().trim() })

  if (existingTeacher) {
    throw createHttpError(409, 'A teacher with this email already exists.')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const teacher = await Teacher.create({
    name,
    email,
    password: hashedPassword,
  })

  res.status(201).json({
    teacher: serializeTeacher(teacher),
    token: signToken(teacher),
  })
})

const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw createHttpError(400, 'Email and password are required.')
  }

  const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() }).select('+password')

  if (!teacher) {
    throw createHttpError(401, 'Invalid email or password.')
  }

  const passwordMatches = await bcrypt.compare(password, teacher.password)

  if (!passwordMatches) {
    throw createHttpError(401, 'Invalid email or password.')
  }

  res.json({
    teacher: serializeTeacher(teacher),
    token: signToken(teacher),
  })
})

function signToken(teacher) {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'JWT_SECRET is missing on the server.')
  }

  return jwt.sign({ teacherId: teacher._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function serializeTeacher(teacher) {
  return {
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    courses: teacher.courses,
  }
}

module.exports = { signup, signin }
