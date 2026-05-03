const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    totalStudents: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
      },
    ],
  },
  { timestamps: true },
)

CourseSchema.index({ teacher: 1, code: 1 }, { unique: true })

module.exports = mongoose.model('Course', CourseSchema)
