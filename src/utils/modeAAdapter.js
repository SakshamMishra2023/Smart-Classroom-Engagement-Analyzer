import { courseList } from '../data/mockData'

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#6366f1', '#14b8a6']

// Class ID → human-readable label
const CLASS_LABELS = {
  '0': 'Looking at Board',
  '1': 'Looking Down (Writing)',
  '2': 'Head Turn',
  '9': 'Head Down (Sleeping)',
}

const ENGAGED_CLASSES = ['0', '1']
const NON_ENGAGED_CLASSES = ['2', '9']
const RELEVANT_CLASSES = [...ENGAGED_CLASSES, ...NON_ENGAGED_CLASSES]

// Default exam class data keyed by mock course id
const MOCK_EXAM_DATA = Object.fromEntries(
  courseList.map((c) => [c.id, c.modes.exam]),
)

export function adaptModeACourses(courses) {
  return courses.map((course) => {
    const lectures = course.lectures || []
    const classes = lectures.length
      ? lectures.map((lecture) => adaptLecture(lecture, course))
      : [buildEmptyClass(course)]
    const students = classes.map((classData) => classData.aggregateStudent)

    return {
      id: course._id || course.id,
      title: course.name,
      code: course.code,
      room: 'MongoDB',
      schedule: `${course.totalStudents || 0} enrolled`,
      students,
      modes: {
        concentration: {
          classes,
        },
      },
    }
  })
}

/**
 * Build Mode B course list from the same backend courses so the sidebar
 * is synced (same course titles / codes), but keep the mock exam class
 * data for the overview panel.
 * Accepts an optional assessments array (from /api/mode-b/assessments)
 * and merges them into the matching course.
 */
export function adaptModeBCourses(backendCourses, assessments = []) {
  return backendCourses.map((raw) => {
    const id = raw._id || raw.id
    const mockMatch = courseList.find((c) => c.code === raw.code)

    // Convert backend assessments for this course into sidebar class entries
    const courseAssessments = assessments
      .filter((a) => String(a.course) === String(id) || String(a.course?._id) === String(id))
      .map((a) => adaptAssessment(a))

    return {
      id,
      title: raw.name,
      code: raw.code,
      room: mockMatch?.room || 'Exam Hall',
      schedule: mockMatch?.schedule || `${raw.totalStudents || 0} enrolled`,
      students: mockMatch?.students || [],
      modes: {
        exam: {
          classes: courseAssessments,
        },
      },
    }
  })
}

/**
 * Map a single backend Assessment document into the sidebar class shape.
 */
function adaptAssessment(assessment) {
  const isCompleted = assessment.status === 'completed'
  const detections = assessment.detections || []
  const totalDetections = assessment.totalDetections || detections.length

  const cheatingPct = Math.min(100, totalDetections * 8)
  const summaryStats = totalDetections > 0
    ? [
        { label: 'Clean behavior', value: 100 - cheatingPct, color: '#10b981' },
        { label: 'Cheating alerts', value: cheatingPct, color: '#f43f5e' },
      ]
    : [{ label: 'Clean behavior', value: 100, color: '#10b981' }]

  const trend = detections.length > 0
    ? buildDetectionTrend(detections)
    : [{ label: '0s', value: 0 }]

  return {
    id: assessment._id,
    title: assessment.title,
    date: assessment.date || formatDate(assessment.createdAt),
    classroom: assessment.classroom,
    engagement: 100,
    attendance: totalDetections,
    status: isCompleted ? 'Completed' : 'Ready',
    isCompleted,
    totalDetections,
    detections,
    summaryStats,
    trend,
    students: [],
  }
}

function buildDetectionTrend(detections) {
  const buckets = new Map()
  for (const d of detections) {
    const sec = d.second || 0
    const bucket = `${Math.floor(sec / 10) * 10}s`
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1)
  }
  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }))
}

function adaptLecture(lecture, course) {
  const totalDetections = lecture.totalDetections || 0
  const classCounts = objectFromPossibleMap(lecture.classCounts)

  // Compute engagement score from relevant classes only
  const engagedCount = ENGAGED_CLASSES.reduce((sum, c) => sum + (classCounts[c] || 0), 0)
  const nonEngagedCount = NON_ENGAGED_CLASSES.reduce((sum, c) => sum + (classCounts[c] || 0), 0)
  const relevantTotal = engagedCount + nonEngagedCount
  const engagementScore = relevantTotal > 0 ? Math.round((engagedCount / relevantTotal) * 100) : 0

  const summaryStats = buildEngagementDonut(engagedCount, nonEngagedCount)
  const trend = buildClassCountTrend(classCounts)
  const aggregateStudentId = `${lecture._id || lecture.id}-aggregate`
  const quickStats = [
    { label: 'Engagement', value: `${engagementScore}%` },
    { label: 'Frames analyzed', value: String(lecture.frameCount || 0) },
    { label: 'Total detections', value: String(totalDetections) },
  ]

  const aggregateStudent = {
    id: aggregateStudentId,
    name: 'Class aggregate',
    rollNumber: course.code,
    seat: lecture.section || 'All',
  }

  return {
    id: lecture._id || lecture.id,
    title: lecture.title,
    date: formatDate(lecture.lectureDate),
    engagement: engagementScore,
    engagementRaw: { engagedCount, nonEngagedCount, relevantTotal },
    totalDetections,
    attendance: course.totalStudents || 0,
    frameCount: lecture.frameCount || 0,
    status: 'Saved',
    isBackendAnalysis: true,
    classCounts,
    summaryStats,
    trend,
    aggregateStudent,
    students: [
      {
        id: aggregateStudentId,
        score: engagementScore,
        badge:
          relevantTotal > 0
            ? `${engagementScore}% engaged — ${engagedCount} engaged vs ${nonEngagedCount} non-engaged detections`
            : 'No detections saved yet',
        activityShare: summaryStats,
        focusTrend: trend,
        quickStats,
      },
    ],
  }
}

function buildEmptyClass(course) {
  const id = `${course._id || course.id}-empty`
  const aggregateStudent = {
    id: `${id}-aggregate`,
    name: 'Class aggregate',
    rollNumber: course.code,
    seat: 'All',
  }

  return {
    id,
    title: 'No Mode A lecture yet',
    date: 'Upload a video to create one',
    engagement: 0,
    attendance: course.totalStudents || 0,
    frameCount: 0,
    status: 'Waiting',
    isBackendAnalysis: true,
    classCounts: {},
    summaryStats: [{ label: 'No detections', value: 0, color: '#94a3b8' }],
    trend: [{ label: 'None', value: 0 }],
    aggregateStudent,
    students: [
      {
        id: aggregateStudent.id,
        score: 0,
        badge: 'Upload a video to generate stored stats',
        activityShare: [{ label: 'No detections', value: 0, color: '#94a3b8' }],
        focusTrend: [{ label: 'F1', value: 0 }],
        quickStats: [
          { label: 'Detections', value: '0' },
          { label: 'Frames analyzed', value: '0' },
          { label: 'Classes found', value: '0' },
        ],
      },
    ],
  }
}

/**
 * Donut chart: Engaged vs Non-engaged.
 * Engaged = classes 0, 1 | Non-engaged = classes 2, 9
 */
function buildEngagementDonut(engagedCount, nonEngagedCount) {
  const total = engagedCount + nonEngagedCount
  if (total === 0) {
    return [{ label: 'No detections', value: 0, color: '#94a3b8' }]
  }

  const engagedPct = Math.round((engagedCount / total) * 100)
  const nonEngagedPct = 100 - engagedPct

  return [
    { label: `Engaged (${engagedCount})`, value: engagedPct, color: '#10b981' },
    { label: `Non-engaged (${nonEngagedCount})`, value: nonEngagedPct, color: '#f43f5e' },
  ]
}

/**
 * Bar chart: Only classes 0, 1, 2, 9 with descriptive labels.
 */
function buildClassCountTrend(classCounts) {
  const bars = RELEVANT_CLASSES
    .filter((classId) => classCounts[classId] != null)
    .map((classId) => ({
      label: CLASS_LABELS[classId] || `Class ${classId}`,
      value: classCounts[classId] || 0,
    }))

  if (!bars.length) {
    return [{ label: 'None', value: 0 }]
  }

  return bars
}

function objectFromPossibleMap(value) {
  if (!value) return {}
  if (value instanceof Map) return Object.fromEntries(value.entries())
  return value
}

function formatDate(rawDate) {
  if (!rawDate) return 'Pending date'

  return new Date(rawDate).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
