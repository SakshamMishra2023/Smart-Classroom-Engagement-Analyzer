const mongoose = require('mongoose')

const ClassSummarySchema = new mongoose.Schema(
  {
    className: String,
    classId: Number,
    count: Number,
    averageConfidence: Number,
  },
  { _id: false },
)

const LectureSchema = new mongoose.Schema(
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
    lectureDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['mode-a', 'mode-b'],
      default: 'mode-a',
      index: true,
    },
    source: {
      videoOriginalName: String,
      videoMimeType: String,
      videoSizeBytes: Number,
    },
    model: {
      provider: {
        type: String,
        default: 'roboflow',
      },
      url: String,
    },
    frameCount: {
      type: Number,
      default: 0,
    },
    totalDetections: {
      type: Number,
      default: 0,
    },
    classCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    classSummaries: [ClassSummarySchema],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Lecture', LectureSchema)
