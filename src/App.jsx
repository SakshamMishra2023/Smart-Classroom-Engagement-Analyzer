import { startTransition, useEffect, useMemo, useState } from 'react'
import { AuthShell } from './components/dashboard/AuthShell'
import { ModeSelection } from './components/ModeSelection'
import { ModeWorkspace } from './components/mode-pages/ModeWorkspace'
import { UploadAnalysisPage } from './components/upload/UploadAnalysisPage'
import { courseList, modeOptions, teacherProfile } from './data/mockData'

function App() {
  const [teacher, setTeacher] = useState(null)
  const [currentPage, setCurrentPage] = useState('auth')
  const [selectedMode, setSelectedMode] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(courseList[0].id)
  const [selectedClassId, setSelectedClassId] = useState(
    courseList[0].modes.concentration.classes[0].id,
  )
  const [selectedStudentId, setSelectedStudentId] = useState(
    courseList[0].modes.concentration.classes[0].students[0].id,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadedVideos, setUploadedVideos] = useState({})
  const [generatedClasses, setGeneratedClasses] = useState([])
  const [liveAlerts, setLiveAlerts] = useState([])
  const [recentAlertId, setRecentAlertId] = useState(null)

  const courses = useMemo(
    () => mergeGeneratedClasses(courseList, generatedClasses),
    [generatedClasses],
  )
  const activeMode = modeOptions.find((mode) => mode.id === selectedMode) ?? modeOptions[0]
  const activeCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]

  useEffect(() => {
    if (!teacher || currentPage !== 'mode-workspace' || selectedMode !== 'exam') {
      return undefined
    }

    const examCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]
    const liveClass = examCourse.modes.exam.classes[0]
    let alertIndex = 0

    const pushAlert = () => {
      const nextStudent = examCourse.students[alertIndex % examCourse.students.length]
      const nextAlertMessage = EXAM_ALERT_MESSAGES[alertIndex % EXAM_ALERT_MESSAGES.length]

      setLiveAlerts((current) => [
        {
          id: `${nextStudent.id}-${Date.now()}`,
          studentId: nextStudent.id,
          studentName: nextStudent.name,
          seat: nextStudent.seat,
          message: nextAlertMessage,
          evidenceImage: `/evidence/exam-alert-${(alertIndex % 4) + 1}.png`,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          classTitle: liveClass.title,
        },
        ...current,
      ].slice(0, 6))

      alertIndex += 1
    }

    const intervalId = window.setInterval(() => {
      pushAlert()
    }, 7000)

    return () => window.clearInterval(intervalId)
  }, [teacher, currentPage, selectedMode, selectedCourseId, generatedClasses.length, courses])

  useEffect(() => {
    if (!liveAlerts[0]?.id) return undefined

    setRecentAlertId(liveAlerts[0].id)
    const timeoutId = window.setTimeout(() => setRecentAlertId(null), 2200)

    return () => window.clearTimeout(timeoutId)
  }, [liveAlerts])

  const handleAuthSubmit = ({ email, name, school }) => {
    setTeacher({
      ...teacherProfile,
      email,
      name: name || teacherProfile.name,
      school: school || teacherProfile.school,
    })
    setCurrentPage('mode-select')
  }

  const syncWorkspaceSelection = (modeId, courseId, courseData = courses) => {
    const nextCourse = courseData.find((course) => course.id === courseId) ?? courseData[0]
    const nextClasses = nextCourse.modes[modeId].classes
    const nextClass = nextClasses[0]

    setSelectedCourseId(nextCourse.id)
    setSelectedClassId(nextClass.id)
    setSelectedStudentId(nextClass.students[0].id)
    setSearchTerm('')
  }

  const handleModeSelect = (modeId) => {
    startTransition(() => {
      setSelectedMode(modeId)
      syncWorkspaceSelection(modeId, selectedCourseId)
      setCurrentPage('mode-workspace')
    })
  }

  const handleCourseChange = (courseId) => {
    if (!selectedMode) return

    startTransition(() => {
      syncWorkspaceSelection(selectedMode, courseId)
    })
  }

  const handleClassChange = (classId) => {
    if (!selectedMode) return

    const course = courses.find((item) => item.id === selectedCourseId) ?? courses[0]
    const nextClass =
      course.modes[selectedMode].classes.find((item) => item.id === classId) ??
      course.modes[selectedMode].classes[0]

    startTransition(() => {
      setSelectedClassId(nextClass.id)
      setSelectedStudentId(nextClass.students[0].id)
      setSearchTerm('')
    })
  }

  const handleVideoPick = (event) => {
    const file = event.target.files?.[0]
    if (!file || !selectedMode) return

    setUploadedVideos((current) => ({
      ...current,
      [selectedMode]: file.name,
    }))
  }

  const handleAnalysisSubmit = (formState) => {
    if (!selectedMode) return

    const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]
    const newClass = buildMockAnalysis(selectedCourse, selectedMode, formState)

    const nextGeneratedClasses = [
      ...generatedClasses,
      { courseId: selectedCourse.id, modeId: selectedMode, classData: newClass },
    ]

    setGeneratedClasses(nextGeneratedClasses)

    const nextCourses = mergeGeneratedClasses(courseList, nextGeneratedClasses)

    setUploadedVideos((current) => ({
      ...current,
      [selectedMode]: undefined,
    }))

    startTransition(() => {
      setCurrentPage('mode-workspace')
      syncWorkspaceSelection(selectedMode, selectedCourse.id, nextCourses)
      setSelectedClassId(newClass.id)
      setSelectedStudentId(newClass.students[0].id)
    })
  }

  if (!teacher) {
    return <AuthShell onSubmit={handleAuthSubmit} />
  }

  if (currentPage === 'mode-select') {
    return (
      <AppBackground>
        <ModeSelection
          modes={modeOptions}
          onLogout={() => {
            setTeacher(null)
            setCurrentPage('auth')
          }}
          onSelectMode={handleModeSelect}
          teacher={teacher}
        />
      </AppBackground>
    )
  }

  if (currentPage === 'upload' && selectedMode === 'concentration') {
    return (
      <AppBackground>
        <UploadAnalysisPage
          course={activeCourse}
          mode={activeMode}
          onBack={() => setCurrentPage('mode-workspace')}
          onSubmit={handleAnalysisSubmit}
          uploadedVideoName={uploadedVideos[selectedMode]}
        />
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <ModeWorkspace
        courses={courses}
        isLiveMonitoring={selectedMode === 'exam'}
        liveAlerts={liveAlerts}
        mode={activeMode}
        recentAlertId={recentAlertId}
        onBack={() => setCurrentPage('mode-select')}
        onClassChange={handleClassChange}
        onCourseChange={handleCourseChange}
        onLogout={() => {
          setTeacher(null)
          setCurrentPage('auth')
        }}
        onOpenUploadPage={() => setCurrentPage('upload')}
        onSearchChange={setSearchTerm}
        onStudentChange={setSelectedStudentId}
        onVideoPick={handleVideoPick}
        searchTerm={searchTerm}
        selectedClassId={selectedClassId}
        selectedCourseId={selectedCourseId}
        selectedStudentId={selectedStudentId}
        teacher={teacher}
        uploadedVideoName={uploadedVideos[selectedMode]}
      />
    </AppBackground>
  )
}

function AppBackground({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      {children}
    </div>
  )
}

function mergeGeneratedClasses(baseCourses, generated) {
  return baseCourses.map((course) => {
    const nextModes = Object.fromEntries(
      Object.entries(course.modes).map(([modeId, modeData]) => {
        const additions = generated
          .filter((item) => item.courseId === course.id && item.modeId === modeId)
          .map((item) => item.classData)

        return [
          modeId,
          {
            ...modeData,
            classes: [...additions.slice().reverse(), ...modeData.classes],
          },
        ]
      }),
    )

    return {
      ...course,
      modes: nextModes,
    }
  })
}

function buildMockAnalysis(course, modeId, formState) {
  const template = course.modes[modeId].classes[0]
  const variance = 4
  const title = formState.lectureTitle || 'New classroom analysis'
  const date = formatDate(formState.lectureDate)

  return {
    ...template,
    id: `${course.id}-${modeId}-${Date.now()}`,
    title,
    date,
    status: 'Generated',
    engagement: 83,
    students: template.students.map((student, index) => ({
      ...student,
      score: Math.max(48, Math.min(95, student.score - variance + index * 2)),
      quickStats: student.quickStats.map((item) => ({ ...item })),
      activityShare: student.activityShare.map((item) => ({ ...item })),
      focusTrend: student.focusTrend.map((point, pointIndex) => ({
        ...point,
        value: Math.max(45, Math.min(96, point.value - 2 + pointIndex)),
      })),
    })),
    trend: template.trend.map((point, index) => ({
      ...point,
      value: Math.max(58, Math.min(93, point.value + (index % 2 === 0 ? 2 : -1))),
    })),
    summaryStats: template.summaryStats.map((item) => ({ ...item })),
    notes: formState.notes,
    section: formState.section,
  }
}

function formatDate(rawDate) {
  if (!rawDate) return 'Pending date'

  const date = new Date(rawDate)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const EXAM_ALERT_MESSAGES = [
  'Repeated glance toward nearby desk detected.',
  'Possible phone interaction under the desk.',
  'Head turn beyond allowed exam cone detected.',
  'Suspicious sideways movement recorded by live feed.',
]

export default App
