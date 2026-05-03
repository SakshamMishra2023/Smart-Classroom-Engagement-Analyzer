import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthShell } from './components/dashboard/AuthShell'
import { ModeSelection } from './components/ModeSelection'
import { ModeWorkspace } from './components/mode-pages/ModeWorkspace'
import { UploadAnalysisPage } from './components/upload/UploadAnalysisPage'
import { api } from './services/api'
import { courseList, modeOptions, teacherProfile } from './data/mockData'
import { adaptModeACourses, adaptModeBCourses } from './utils/modeAAdapter'

const TOKEN_STORAGE_KEY = 'classroom-vision-token'
const TEACHER_STORAGE_KEY = 'classroom-vision-teacher'

function App() {
  const [teacher, setTeacher] = useState(null)
  const [authToken, setAuthToken] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [currentPage, setCurrentPage] = useState('auth')
  const [selectedMode, setSelectedMode] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(courseList[0].id)
  const [selectedClassId, setSelectedClassId] = useState(
    courseList[0].modes.concentration.classes[0].id,
  )
  const [uploadedVideos, setUploadedVideos] = useState({})
  const [modeACourses, setModeACourses] = useState([])
  const [modeBCourses, setModeBCourses] = useState(courseList)
  const [modeBAssessments, setModeBAssessments] = useState([])
  const [generatedClasses] = useState([])
  const [liveAlerts, setLiveAlerts] = useState([])
  const [modeBStatus, setModeBStatus] = useState('idle')
  const [recentAlertId, setRecentAlertId] = useState(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeAssessmentId, setActiveAssessmentId] = useState(null)
  const eventSourceRef = useRef(null)
  const liveAlertsRef = useRef([])

  const examCourses = useMemo(
    () => mergeGeneratedClasses(modeBCourses, generatedClasses),
    [modeBCourses, generatedClasses],
  )
  const courses = selectedMode === 'concentration' ? modeACourses : examCourses
  const activeMode = modeOptions.find((mode) => mode.id === selectedMode) ?? modeOptions[0]
  const activeCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    const savedTeacher = window.localStorage.getItem(TEACHER_STORAGE_KEY)

    if (!savedToken || !savedTeacher) return

    refreshAllCourses(savedToken)
      .then(({ modeA, modeB }) => {
        setAuthToken(savedToken)
        setTeacher(JSON.parse(savedTeacher))
        setModeACourses(modeA)
        setModeBCourses(modeB)
        setCurrentPage('mode-select')
      })
      .catch(() => {
        handleLogout()
      })
  }, [])

  // Clean up SSE on unmount or when leaving Mode B
  useEffect(() => {
    if (currentPage !== 'mode-workspace' || selectedMode !== 'exam') {
      stopMonitoring()
    }
    return () => stopMonitoring()
  }, [currentPage, selectedMode])

  const stopMonitoring = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsMonitoring(false)
    setModeBStatus('idle')
  }, [])

  const finalizeRef = useRef(null)

  // Keep finalize function in a ref so SSE callbacks always have the latest
  finalizeRef.current = async () => {
    const assessId = activeAssessmentId
    const alertsToSave = liveAlertsRef.current

    stopMonitoring()

    if (!assessId) {
      setActiveAssessmentId(null)
      return
    }

    setIsSaving(true)

    try {
      await api.finalizeAssessment(authToken, assessId, alertsToSave)
      const { modeA, modeB } = await refreshAllCourses(authToken)
      setModeACourses(modeA)
      setModeBCourses(modeB)
    } catch (err) {
      console.error('Failed to finalize assessment:', err)
    } finally {
      setIsSaving(false)
      setActiveAssessmentId(null)
    }
  }

  const startMonitoring = useCallback((classroom, assessmentId) => {
    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setActiveAssessmentId(assessmentId || null)

    const selectedAssessment = modeBAssessments.find((a) =>
      a.courseId === selectedCourseId && a.classroom === classroom
    )
    const assessmentTitle = selectedAssessment?.title || 'Live Exam'

    const eventSource = new EventSource(api.modeBStreamUrl(authToken, classroom))
    eventSourceRef.current = eventSource

    setLiveAlerts([])
    liveAlertsRef.current = []
    setIsMonitoring(true)
    setModeBStatus('connecting')

    eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data)
      setModeBStatus(data.status)

      // Auto-finalize when simulation completes
      if (data.status === 'completed') {
        eventSource.close()
        eventSourceRef.current = null
        setIsMonitoring(false)
        // Use setTimeout to let state settle before finalizing
        setTimeout(() => finalizeRef.current?.(), 100)
      }
    })

    eventSource.addEventListener('heartbeat', () => {
      setModeBStatus('running')
    })

    eventSource.addEventListener('alert', (event) => {
      const data = JSON.parse(event.data)

      const newAlert = {
        id: data.id,
        studentId: 'unknown',
        studentName: 'Possible cheating',
        seat: `Second ${data.second}`,
        second: data.second,
        confidence: data.confidence || 0,
        message: `${data.message} Confidence: ${Math.round((data.confidence || 0) * 100)}%.`,
        evidenceImage: data.evidenceImage,
        time: data.time,
        classTitle: assessmentTitle,
      }

      liveAlertsRef.current = [newAlert, ...liveAlertsRef.current].slice(0, 50)
      setLiveAlerts((current) => [newAlert, ...current].slice(0, 10))
    })

    eventSource.onerror = () => {
      setModeBStatus('error')
      eventSource.close()
      eventSourceRef.current = null
      setIsMonitoring(false)
    }
  }, [authToken, selectedCourseId, modeBAssessments])

  useEffect(() => {
    if (!liveAlerts[0]?.id) return undefined

    setRecentAlertId(liveAlerts[0].id)
    const timeoutId = window.setTimeout(() => setRecentAlertId(null), 2200)

    return () => window.clearTimeout(timeoutId)
  }, [liveAlerts])

  const handleAuthSubmit = async ({ authMode, email, name, password }) => {
    setAuthError('')
    setIsAuthenticating(true)

    try {
      const response =
        authMode === 'signup'
          ? await api.signup({ name, email, password })
          : await api.signin({ email, password })

      const nextTeacher = {
        ...teacherProfile,
        ...response.teacher,
      }
      const { modeA, modeB } = await refreshAllCourses(response.token)

      setTeacher(nextTeacher)
      setAuthToken(response.token)
      setModeACourses(modeA)
      setModeBCourses(modeB)
      window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
      window.localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(nextTeacher))
      setCurrentPage('mode-select')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const refreshAllCourses = async (token) => {
    const response = await api.getCourses(token)
    let rawCourses = response.courses || []

    if (rawCourses.length === 0) {
      await Promise.all(
        courseList.map((course) =>
          api.createCourse(token, {
            name: course.title,
            code: course.code,
            totalStudents: course.students.length,
          }),
        ),
      )

      rawCourses = (await api.getCourses(token)).courses || []
    }

    // Also fetch assessments
    let assessments = []
    try {
      const assessmentRes = await api.getAssessments(token)
      assessments = assessmentRes.assessments || []
    } catch {
      // Assessments might not exist yet
    }

    return {
      modeA: adaptModeACourses(rawCourses),
      modeB: adaptModeBCourses(rawCourses, assessments),
      assessments,
    }
  }

  const syncWorkspaceSelection = (modeId, courseId, courseData) => {
    const nextCourse = courseData.find((course) => course.id === courseId) ?? courseData[0]
    if (!nextCourse) return

    const nextClasses = nextCourse.modes[modeId]?.classes || []
    const nextClass = nextClasses[0]
    if (!nextClass) return

    setSelectedCourseId(nextCourse.id)
    setSelectedClassId(nextClass.id)
  }

  const handleModeSelect = (modeId) => {
    const targetCourses = modeId === 'concentration' ? modeACourses : examCourses

    startTransition(() => {
      setSelectedMode(modeId)
      syncWorkspaceSelection(modeId, selectedCourseId, targetCourses)
      setCurrentPage('mode-workspace')
    })
  }

  const handleCourseChange = (courseId) => {
    if (!selectedMode) return

    startTransition(() => {
      syncWorkspaceSelection(selectedMode, courseId, courses)
    })
  }

  const handleClassChange = (classId) => {
    if (!selectedMode) return

    startTransition(() => {
      setSelectedClassId(classId)
    })
  }

  const handleAddAssessment = async (assessment) => {
    try {
      const response = await api.createAssessment(authToken, {
        title: assessment.title,
        date: assessment.date,
        classroom: assessment.classroom,
        courseId: selectedCourseId,
      })

      const saved = response.assessment
      const newAssessment = {
        id: saved._id,
        courseId: selectedCourseId,
        title: saved.title,
        date: saved.date,
        classroom: saved.classroom,
        engagement: 100,
        attendance: 0,
        status: 'Ready',
        isCompleted: false,
        totalDetections: 0,
        detections: [],
        summaryStats: [{ label: 'Clean behavior', value: 100, color: '#10b981' }],
        trend: [{ label: '0s', value: 0 }],
        students: [],
      }

      setModeBAssessments((current) => [...current, newAssessment])

      // Merge assessment into exam courses
      setModeBCourses((current) =>
        current.map((course) => {
          if (course.id !== selectedCourseId) return course

          const examMode = course.modes?.exam || { classes: [] }
          return {
            ...course,
            modes: {
              ...course.modes,
              exam: {
                ...examMode,
                classes: [
                  newAssessment,
                  ...examMode.classes,
                ],
              },
            },
          }
        }),
      )

      // Select the new assessment
      startTransition(() => {
        setSelectedClassId(newAssessment.id)
      })
    } catch (err) {
      console.error('Failed to create assessment:', err)
    }
  }

  const handleStartMonitoring = (classroom, assessmentId) => {
    startMonitoring(classroom, assessmentId)
  }

  const handleStopMonitoring = () => {
    finalizeRef.current?.()
  }

  const handleVideoPick = (event) => {
    const file = event.target.files?.[0]
    if (!file || selectedMode !== 'concentration') return

    setUploadedVideos((current) => ({
      ...current,
      concentration: file,
    }))
    setCurrentPage('upload')
  }

  const handleAnalysisSubmit = async (formState) => {
    const selectedCourse = modeACourses.find((course) => course.id === selectedCourseId)
    const uploadedVideo = uploadedVideos.concentration

    if (!selectedCourse || !uploadedVideo || !authToken) {
      throw new Error('Select a course and video before running analysis.')
    }

    const response = await api.analyzeModeAVideo(
      authToken,
      selectedCourse.id,
      uploadedVideo,
      formState,
    )
    const { modeA: nextCourses, modeB: nextBCourses } = await refreshAllCourses(authToken)
    setModeBCourses(nextBCourses)
    const nextCourse = nextCourses.find((course) => course.id === selectedCourse.id) ?? nextCourses[0]
    const nextClass =
      nextCourse?.modes.concentration.classes.find((item) => item.id === response.lectureId) ??
      nextCourse?.modes.concentration.classes[0]

    setModeACourses(nextCourses)
    setUploadedVideos((current) => ({
      ...current,
      concentration: undefined,
    }))

    startTransition(() => {
      setCurrentPage('mode-workspace')
      if (nextCourse && nextClass) {
        setSelectedCourseId(nextCourse.id)
        setSelectedClassId(nextClass.id)
      }
    })
  }

  const handleLogout = () => {
    setTeacher(null)
    setAuthToken('')
    setCurrentPage('auth')
    setSelectedMode(null)
    setUploadedVideos({})
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.removeItem(TEACHER_STORAGE_KEY)
  }

  if (!teacher) {
    return (
      <AuthShell
        error={authError}
        isSubmitting={isAuthenticating}
        onSubmit={handleAuthSubmit}
      />
    )
  }

  if (currentPage === 'mode-select') {
    return (
      <AppBackground>
        <ModeSelection modes={modeOptions} onLogout={handleLogout} onSelectMode={handleModeSelect} teacher={teacher} />
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
          uploadedVideoName={uploadedVideos.concentration?.name}
        />
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <ModeWorkspace
        courses={courses}
        isLiveMonitoring={isMonitoring}
        isSaving={isSaving}
        liveAlerts={liveAlerts}
        mode={activeMode}
        recentAlertId={recentAlertId}
        modeBStatus={modeBStatus}
        onBack={() => setCurrentPage('mode-select')}
        onClassChange={handleClassChange}
        onCourseChange={handleCourseChange}
        onLogout={handleLogout}
        onVideoPick={handleVideoPick}
        onAddAssessment={handleAddAssessment}
        onStartMonitoring={handleStartMonitoring}
        onStopMonitoring={handleStopMonitoring}
        selectedClassId={selectedClassId}
        selectedCourseId={selectedCourseId}
        teacher={teacher}
        uploadedVideoName={uploadedVideos.concentration?.name}
      />
    </AppBackground>
  )
}

function AppBackground({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.15),_transparent_40%),#0B1120] text-slate-100">
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

export default App
