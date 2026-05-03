const Course = require('../models/Course')
const createHttpError = require('./httpError')

async function findOwnedCourse(courseId, teacherId) {
  const course = await Course.findOne({ _id: courseId, teacher: teacherId })

  if (!course) {
    throw createHttpError(404, 'Course not found for this teacher.')
  }

  return course
}

module.exports = { findOwnedCourse }
