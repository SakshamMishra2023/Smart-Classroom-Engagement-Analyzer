import { useState } from 'react'
import { DonutChart } from '../charts/DonutChart'
import { LineChart } from '../charts/LineChart'
import { BarChart } from '../charts/BarChart'

export function ModeWorkspace({
  teacher,
  mode,
  courses,
  selectedCourseId,
  selectedClassId,
  selectedStudentId,
  searchTerm,
  uploadedVideoName,
  liveAlerts,
  isLiveMonitoring,
  recentAlertId,
  onBack,
  onLogout,
  onCourseChange,
  onClassChange,
  onStudentChange,
  onSearchChange,
  onVideoPick,
  onOpenUploadPage,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  const selectedCourse =
    courses.find((course) => course.id === selectedCourseId) ?? courses[0]
  const modeData = selectedCourse.modes[mode.id]
  const selectedClass =
    modeData.classes.find((item) => item.id === selectedClassId) ?? modeData.classes[0]

  const studentEntries = selectedClass.students
    .map((entry) => {
      const student = selectedCourse.students.find((item) => item.id === entry.id)
      return student ? { ...student, ...entry } : null
    })
    .filter(Boolean)

  const visibleStudents = studentEntries.filter((student) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true

    return [student.name, student.rollNumber, student.seat]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const selectedStudent =
    studentEntries.find((student) => student.id === selectedStudentId) ?? studentEntries[0]

  const isConcentrationMode = mode.id === 'concentration'
  const detailStats = isConcentrationMode
    ? selectedStudent.quickStats
    : selectedStudent.quickStats.filter((item) => item.label !== 'Risk score')
  const selectedAlert =
    liveAlerts.find((alert) => alert.id === selectedAlertId) ?? liveAlerts[0] ?? null

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="card-rise rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="interactive rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                onClick={onBack}
                type="button"
              >
                Back to modes
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {mode.label}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              {mode.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {isConcentrationMode
                ? `${teacher.name} can review previous classroom sessions or upload a fresh video to simulate a new analysis run`
                : `${teacher.name} can watch live invigilation status, open notifications, and inspect the exact cheating snapshot for each alert`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Teacher</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{teacher.name}</p>
            </div>
            <button
              className="interactive rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={onLogout}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Panel title="Courses">
            <div className="grid gap-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`interactive rounded-2xl border px-4 py-4 text-left transition ${
                    selectedCourseId === course.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => onCourseChange(course.id)}
                  type="button"
                >
                  <p className="font-semibold">{course.title}</p>
                  <p
                    className={`mt-1 text-sm ${
                      selectedCourseId === course.id ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {course.code} | {course.schedule}
                  </p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Class sessions">
            <div className="grid gap-3">
              {modeData.classes.map((item) => (
                <button
                  key={item.id}
                  className={`interactive rounded-2xl border px-4 py-4 text-left transition ${
                    selectedClassId === item.id
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => onClassChange(item.id)}
                  type="button"
                >
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.attendance} present</span>
                    <span>{item.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {isConcentrationMode ? (
            <Panel title="New analysis">
              <label className="interactive flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-slate-400 hover:bg-white">
                <span className="text-sm font-medium text-slate-900">Choose classroom video</span>
                <span className="mt-2 text-sm leading-6 text-slate-500">
                  Select the lecture recording first, then continue to the upload form.
                </span>
                <input className="hidden" onChange={onVideoPick} type="file" />
                <span className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Select video
                </span>
              </label>
              <p className="mt-3 text-sm text-slate-500">
                {uploadedVideoName ? `Selected: ${uploadedVideoName}` : 'No file selected yet.'}
              </p>
              <button
                className="interactive mt-4 w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!uploadedVideoName}
                onClick={onOpenUploadPage}
                type="button"
              >
                Continue to upload details
              </button>
            </Panel>
          ) : null}
        </aside>

        <main className="space-y-6">
          {!isConcentrationMode ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Panel title="Live invigilation" subtitle="Exam mode active">
                <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Status</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {isLiveMonitoring ? 'Live monitoring connected' : 'Feed paused'}
                      </p>
                    </div>
                    <span className="soft-pulse inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <Metric label="Alerts received" value={`${liveAlerts.length}`} compactDark />
                    <Metric label="Room" value={selectedCourse.room} compactDark />
                    <Metric label="Mode" value="Exam live" compactDark />
                  </div>

                  <div className="loading-dots mt-8 text-sm text-slate-300">
                    Detecting side glances, phone usage, and suspicious movement
                  </div>

                  <button
                    className="interactive mt-8 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                    onClick={() => setNotificationsOpen((current) => !current)}
                    type="button"
                  >
                    {notificationsOpen
                      ? 'Hide notifications'
                      : `Open notifications (${liveAlerts.length})`}
                  </button>

                 
                </div>
              </Panel>

              <Panel title="Alert evidence" subtitle="Click a notification to inspect the snapshot">
                {selectedAlert ? (
                  <EvidenceViewer alert={selectedAlert} isFresh={selectedAlert.id === recentAlertId} />
                ) : (
                  <EmptyState text="When a cheating alert appears, click it to inspect the exact evidence image here." />
                )}
              </Panel>
            </section>
          ) : null}

          {!isConcentrationMode ? (
            <Panel title="Notifications" subtitle="Latest cheating alerts">
              <div className="space-y-3">
                {notificationsOpen ? (
                  liveAlerts.length > 0 ? (
                    liveAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        className={`interactive w-full rounded-3xl border px-4 py-4 text-left ${
                          selectedAlert?.id === alert.id
                            ? 'border-rose-200 bg-rose-50'
                            : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                        } ${alert.id === recentAlertId ? 'alert-fresh border-rose-300 bg-rose-100' : ''}`}
                        onClick={() => setSelectedAlertId(alert.id)}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{alert.studentName}</p>
                            <p className="mt-1 text-sm text-slate-500">Seat {alert.seat}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                            {alert.time}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-rose-700">{alert.message}</p>
                      </button>
                    ))
                  ) : (
                    <EmptyState text="No alerts yet. The notification feed will populate while the live invigilation session runs." />
                  )
                ) : (
                  <EmptyState text="Open notifications to click an alert and inspect its cheating snapshot." />
                )}
              </div>
            </Panel>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Panel title={`${selectedClass.title} overview`} subtitle={selectedClass.date}>
              <div className="grid gap-4 md:grid-cols-3">
                <Metric
                  label={isConcentrationMode ? 'Class engagement' : 'Integrity score'}
                  value={`${selectedClass.engagement}%`}
                />
                <Metric label="Attendance" value={`${selectedClass.attendance}`} />
                <Metric label="Course" value={selectedCourse.code} />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Class activity mix</p>
                  <div className="mt-5">
                    <DonutChart
                      centerLabel={isConcentrationMode ? 'engagement' : 'integrity'}
                      data={selectedClass.summaryStats}
                      valueLabel={`${selectedClass.engagement}%`}
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {isConcentrationMode ? 'Engagement trend' : 'Alert trend'}
                  </p>
                  <div className="mt-5">
                    <LineChart
                      color={isConcentrationMode ? '#0f766e' : '#dc2626'}
                      data={selectedClass.trend}
                      yLabel={isConcentrationMode ? 'focus level' : 'alert frequency'}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Student list">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-500">Search</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Name, roll number, seat"
                  value={searchTerm}
                />
              </label>

              <div className="mt-4 grid gap-3">
                {visibleStudents.map((student) => (
                  <button
                    key={student.id}
                    className={`interactive rounded-2xl border px-4 py-4 text-left transition ${
                      selectedStudent.id === student.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => onStudentChange(student.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p
                          className={`mt-1 text-sm ${
                            selectedStudent.id === student.id
                              ? 'text-slate-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {student.rollNumber} | Seat {student.seat}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          selectedStudent.id === student.id
                            ? 'bg-white/10 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isConcentrationMode
                          ? `${student.score}% focus`
                          : `${getQuickStat(student.quickStats, 'Alert count')} alerts`}
                      </span>
                    </div>
                    <p
                      className={`mt-3 text-sm ${
                        selectedStudent.id === student.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {student.badge}
                    </p>
                  </button>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Panel
              title={selectedStudent.name}
              subtitle={`${selectedStudent.rollNumber} | Seat ${selectedStudent.seat}`}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {detailStats.map((item) => (
                  <Metric key={item.label} label={item.label} value={item.value} compact />
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {isConcentrationMode ? 'Student activity share' : 'Behavior share'}
                  </p>
                  <div className="mt-5">
                    <DonutChart
                      centerLabel={isConcentrationMode ? 'focus' : 'alerts'}
                      data={selectedStudent.activityShare}
                      valueLabel={
                        isConcentrationMode
                          ? `${selectedStudent.score}%`
                          : `${getQuickStat(selectedStudent.quickStats, 'Alert count')}`
                      }
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {isConcentrationMode ? 'Focus score over class' : 'Alert progression'}
                  </p>
                  <div className="mt-5">
                    <LineChart
                      color={isConcentrationMode ? '#0284c7' : '#b91c1c'}
                      data={selectedStudent.focusTrend}
                      yLabel={isConcentrationMode ? 'student focus' : 'alert intensity'}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Quick breakdown">
              <BarChart
                color={isConcentrationMode ? 'bg-emerald-500' : 'bg-rose-500'}
                data={selectedStudent.activityShare}
              />
            </Panel>
          </section>
        </main>
      </section>
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="card-rise rounded-[32px] border border-white/60 bg-white/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Metric({ label, value, compact = false, compactDark = false }) {
  const baseClass = compactDark
    ? 'rounded-2xl border border-white/10 bg-white/5 p-4'
    : `rounded-2xl bg-slate-50 p-4 ${compact ? '' : 'border border-slate-100'}`

  return (
    <div className={baseClass}>
      <p
        className={`text-xs uppercase tracking-[0.24em] ${
          compactDark ? 'text-slate-400' : 'text-slate-400'
        }`}
      >
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${compactDark ? 'text-white' : 'text-slate-950'}`}>
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
      {text}
    </div>
  )
}

function EvidenceViewer({ alert, isFresh = false }) {
  return (
    <div className={`space-y-4 rounded-[28px] p-3 transition ${isFresh ? 'alert-evidence bg-rose-100' : 'bg-slate-50'}`}>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
        <img
          alt={`Alert evidence for ${alert.studentName}`}
          className="h-80 w-full bg-slate-950 object-contain"
          onError={(event) => {
            event.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="Arial" font-size="36">Put cheating snapshot here</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="22">public/evidence/exam-alert-1.png</text></svg>'
          }}
          src={alert.evidenceImage}
        />
      </div>

      <div className={`rounded-3xl p-5 ${isFresh ? 'bg-white' : 'bg-white/80'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-950">{alert.studentName}</p>
            <p className="mt-1 text-sm text-slate-500">
              Seat {alert.seat} | {alert.classTitle}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
            {alert.time}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{alert.message}</p>
      </div>
    </div>
  )
}

function getQuickStat(stats, label) {
  return stats.find((item) => item.label === label)?.value ?? '-'
}
