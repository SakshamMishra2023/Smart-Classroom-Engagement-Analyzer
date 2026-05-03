const Course = require('../models/Course')
const Teacher = require('../models/Teacher')
const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')
const { findOwnedCourse } = require('../utils/courseAccess')

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.teacher._id })
    .populate({
      path: 'lectures',
      select:
        'title lectureDate section mode frameCount totalDetections classCounts classSummaries createdAt',
      options: { sort: { lectureDate: -1 } },
    })
    .sort({ createdAt: -1 })

  res.json({ courses })
})

const createCourse = asyncHandler(async (req, res) => {
  const { name, code, totalStudents } = req.body

  if (!name || !code) {
    throw createHttpError(400, 'Course name and course code are required.')
  }

  const course = await Course.create({
    teacher: req.teacher._id,
    name,
    code,
    totalStudents: Number(totalStudents) || 0,
  })

  await Teacher.findByIdAndUpdate(req.teacher._id, {
    $addToSet: { courses: course._id },
  })

  res.status(201).json({ course })
})

const getCourse = asyncHandler(async (req, res) => {
  const course = await findOwnedCourse(req.params.courseId, req.teacher._id)
  await course.populate({
    path: 'lectures',
    select:
      'title lectureDate section mode frameCount totalDetections classCounts classSummaries createdAt',
    options: { sort: { lectureDate: -1 } },
  })

  res.json({ course })
})

module.exports = { getCourses, createCourse, getCourse }
