const Course = require('../models/Course')
const Lecture = require('../models/Lecture')
const asyncHandler = require('../middleware/asyncHandler')
const createHttpError = require('../utils/httpError')
const { findOwnedCourse } = require('../utils/courseAccess')

const createLecture = asyncHandler(async (req, res) => {
  const course = await findOwnedCourse(req.params.courseId, req.teacher._id)
  const { title, lectureDate, section, notes, mode } = req.body

  if (!title) {
    throw createHttpError(400, 'Lecture title is required.')
  }

  const lecture = await Lecture.create({
    teacher: req.teacher._id,
    course: course._id,
    title,
    lectureDate: lectureDate || Date.now(),
    section,
    notes,
    mode: mode || 'mode-a',
  })

  await Course.findByIdAndUpdate(course._id, {
    $addToSet: { lectures: lecture._id },
  })

  res.status(201).json({ lecture })
})

const getLectures = asyncHandler(async (req, res) => {
  const course = await findOwnedCourse(req.params.courseId, req.teacher._id)
  const lectures = await Lecture.find({ course: course._id, teacher: req.teacher._id }).sort({
    lectureDate: -1,
  })

  res.json({ lectures })
})

const getLecture = asyncHandler(async (req, res) => {
  const course = await findOwnedCourse(req.params.courseId, req.teacher._id)
  const lecture = await Lecture.findOne({
    _id: req.params.lectureId,
    course: course._id,
    teacher: req.teacher._id,
  })

  if (!lecture) {
    throw createHttpError(404, 'Lecture not found for this course.')
  }

  res.json({ lecture })
})

module.exports = { createLecture, getLectures, getLecture }
