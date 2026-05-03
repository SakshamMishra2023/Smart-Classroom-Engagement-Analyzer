const mongoose = require('mongoose')

const DetectionSchema = new mongoose.Schema(
  {
    confidence: {
      type: Number,
      default: 0,
    },
    second: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
  },
  { _id: false },
)

const AssessmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
      default: '',
    },
    classroom: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ready', 'monitoring', 'completed'],
      default: 'ready',
    },
    totalDetections: {
      type: Number,
      default: 0,
    },
    detections: [DetectionSchema],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Assessment', AssessmentSchema)
