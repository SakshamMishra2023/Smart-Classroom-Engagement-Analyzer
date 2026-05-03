const express = require('express')

const {
  createCourse,
  getCourse,
  getCourses,
} = require('../controllers/courseController')
const {
  createLecture,
  getLecture,
  getLectures,
} = require('../controllers/lectureController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.route('/').get(getCourses).post(createCourse)
router.route('/:courseId').get(getCourse)
router.route('/:courseId/lectures').get(getLectures).post(createLecture)
router.route('/:courseId/lectures/:lectureId').get(getLecture)

module.exports = router
