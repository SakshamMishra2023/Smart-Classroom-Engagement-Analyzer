import { useMemo, useState } from 'react'
import { DonutChart } from '../charts/DonutChart'
import { LineChart } from '../charts/LineChart'
import { BarChart } from '../charts/BarChart'

export function ModeWorkspace({
  teacher,
  mode,
  courses,
  selectedCourseId,
  selectedClassId,
  liveAlerts,
  isLiveMonitoring,
  isSaving,
  modeBStatus,
  recentAlertId,
  onBack,
  onLogout,
  onCourseChange,
  onClassChange,
  onVideoPick,
  onAddAssessment,
  onStartMonitoring,
  onStopMonitoring,
  uploadedVideoName,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const [assessmentForm, setAssessmentForm] = useState({ title: '', date: '', classroom: '' })
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]

  // Guard against missing modeData
  const modeData = selectedCourse.modes[mode.id]
  if (!modeData) return <div className="text-white p-8">Loading mode data...</div>

  const selectedClass = modeData.classes.find((item) => item.id === selectedClassId) ?? modeData.classes[0]

  const isConcentrationMode = mode.id === 'concentration'
  const chartData = selectedClass.trend || []
  const selectedAlert = liveAlerts.find((alert) => alert.id === selectedAlertId) ?? liveAlerts[0] ?? null

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-slate-100">
      <header className="card-rise rounded-[32px] border border-white/10 glass-panel p-6 shadow-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="interactive rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                onClick={onBack}
                type="button"
              >
                Back to modes
              </button>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {mode.label}
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white mb-2">
              {mode.name}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">
              {isConcentrationMode
                ? "Post-lecture spatial diagnostics. Analyze dynamic behavior heatmaps and engagement timelines."
                : `${teacher.name} can watch live invigilation status, open notifications, and inspect the exact cheating snapshot.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-800/50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Teacher</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">{teacher.name}</p>
            </div>
            <button
              className="interactive rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
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
                      ? 'border-sky-500 bg-sky-900/20 text-white'
                      : 'border-slate-800 glass-panel hover:border-slate-600'
                  }`}
                  onClick={() => onCourseChange(course.id)}
                  type="button"
                >
                  <p className="font-semibold">{course.title}</p>
                  <p className={`mt-1 text-sm ${selectedCourseId === course.id ? 'text-sky-200' : 'text-slate-400'}`}>
                    {course.code} | {course.schedule}
                  </p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={isConcentrationMode ? 'Lecture Analysis' : 'Assessments'}>
            <div className="grid gap-3">
              {modeData.classes.map((item) => (
                <button
                  key={item.id}
                  className={`interactive rounded-2xl border px-4 py-4 text-left transition ${
                    selectedClassId === item.id
                      ? 'border-emerald-500 bg-emerald-900/20 text-white'
                      : 'border-slate-800 glass-panel hover:border-slate-600'
                  }`}
                  onClick={() => onClassChange(item.id)}
                  type="button"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.date}</p>
                  {item.classroom && (
                    <p className="mt-1 text-xs font-mono text-slate-500">Room: {item.classroom}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.isBackendAnalysis ? `${item.attendance} enrolled` : `${item.attendance} present`}</span>
                    <span className={`${
                      item.isCompleted
                        ? 'text-violet-400 font-bold'
                        : selectedClassId === item.id
                          ? 'text-emerald-400 font-bold'
                          : ''
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {isConcentrationMode && (
            <Panel title="Upload New">
              <div className="flex flex-col gap-4">
                <label className="interactive flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/30 px-5 py-8 text-center transition hover:border-slate-500 hover:bg-slate-800">
                  <span className="text-sm font-medium text-slate-200">Analyze Video</span>
                  <span className="mt-2 text-sm leading-6 text-slate-400">
                    Upload a classroom recording. The backend samples frames, calls Roboflow,
                    and saves only total detections for each class.
                  </span>
                  <input accept="video/*" className="hidden" onChange={onVideoPick} type="file" />
                  <span className="mt-5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">
                    Upload file
                  </span>
                </label>
                {uploadedVideoName ? (
                  <p className="text-sm text-slate-400">Selected: {uploadedVideoName}</p>
                ) : null}
              </div>
            </Panel>
          )}

          {!isConcentrationMode && (
            <>
              <Panel title="Add Assessment">
                {showAssessmentForm ? (
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 transition"
                      placeholder="Assessment name"
                      value={assessmentForm.title}
                      onChange={(e) => setAssessmentForm((f) => ({ ...f, title: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 transition"
                      placeholder="Date (e.g. April 22, 2026)"
                      type="text"
                      value={assessmentForm.date}
                      onChange={(e) => setAssessmentForm((f) => ({ ...f, date: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 transition"
                      placeholder="Classroom (e.g. C101)"
                      value={assessmentForm.classroom}
                      onChange={(e) => setAssessmentForm((f) => ({ ...f, classroom: e.target.value }))}
                    />
                    <p className="text-xs text-slate-500 leading-5">
                      Video source: <span className="font-mono text-slate-400">simulation/{assessmentForm.classroom || '...'}.mp4</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="interactive flex-1 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40"
                        disabled={!assessmentForm.title.trim() || !assessmentForm.classroom.trim()}
                        onClick={() => {
                          onAddAssessment(assessmentForm)
                          setAssessmentForm({ title: '', date: '', classroom: '' })
                          setShowAssessmentForm(false)
                        }}
                        type="button"
                      >
                        Create
                      </button>
                      <button
                        className="interactive rounded-xl border border-slate-700 px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800"
                        onClick={() => setShowAssessmentForm(false)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="interactive w-full rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 px-4 py-5 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                    onClick={() => setShowAssessmentForm(true)}
                    type="button"
                  >
                    + New Assessment
                  </button>
                )}
              </Panel>

              <Panel title="Monitoring">
                {isSaving ? (
                  <div className="space-y-3 text-center py-2">
                    <div className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 soft-pulse" />
                    <p className="text-sm text-amber-300 font-medium">Saving results...</p>
                    <p className="text-xs text-slate-500">Uploading evidence images to cloud storage</p>
                  </div>
                ) : selectedClass?.isCompleted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
                      <span className="text-sm text-violet-300 font-medium">Assessment completed</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedClass.totalDetections || 0} cheating detections recorded
                    </p>
                    {selectedClass.classroom && (
                      <p className="text-xs text-slate-500">
                        Classroom: <span className="text-slate-300 font-mono">{selectedClass.classroom}</span>
                      </p>
                    )}
                  </div>
                ) : selectedClass?.classroom ? (
                  isLiveMonitoring ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 soft-pulse" />
                        <span className="text-sm text-emerald-300 font-medium">Monitoring active</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Classroom: <span className="text-slate-300 font-mono">{selectedClass.classroom}</span>
                      </p>
                      <button
                        className="interactive w-full rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
                        onClick={onStopMonitoring}
                        type="button"
                      >
                        Stop Monitoring
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Classroom: <span className="text-slate-300 font-mono">{selectedClass.classroom}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Video: <span className="text-slate-400 font-mono">simulation/{selectedClass.classroom}.mp4</span>
                      </p>
                      <button
                        className="interactive w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        onClick={() => onStartMonitoring(selectedClass.classroom, selectedClass.id)}
                        type="button"
                      >
                        ▶ Start Live Monitoring
                      </button>
                    </div>
                  )
                ) : (
                  <EmptyState text="Select an assessment with a classroom to start live monitoring." />
                )}
              </Panel>
            </>
          )}
        </aside>

        <main className="space-y-6">
          {isConcentrationMode ? (
            <>
              <section className="grid gap-6 md:grid-cols-3">
                <Metric label="Engagement score" value={`${selectedClass.engagement}%`} />
                <Metric label="Frames analyzed" value={`${selectedClass.frameCount ?? chartData.length}`} />
                <Metric label="Total detections" value={`${selectedClass.totalDetections ?? 0}`} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <Panel title="Engagement breakdown" subtitle={selectedClass.date}>
                  <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-5">
                    <DonutChart
                      centerLabel="engagement"
                      data={selectedClass.summaryStats}
                      valueLabel={`${selectedClass.engagement}%`}
                    />
                  </div>
                </Panel>

                <Panel title="Behavior distribution" subtitle="Detections by behavior type">
                  <div className="mt-4">
                    <BarChart color="bg-sky-500" data={chartData} maxValue={Math.max(...chartData.map(d => d.value), 1)} valueSuffix="" />
                  </div>
                </Panel>
              </section>

              <Panel title="Behavior class counts">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(selectedClass.classCounts || {}).length > 0 ? (
                    Object.entries(selectedClass.classCounts)
                      .filter(([classId]) => ['0', '1', '2', '9'].includes(classId))
                      .map(([classId, count]) => {
                        const labels = {
                          '0': 'Looking at Board',
                          '1': 'Looking Down (Writing)',
                          '2': 'Head Turn',
                          '9': 'Head Down (Sleeping)',
                        }
                        const isEngaged = ['0', '1'].includes(classId)
                        return (
                          <div
                            className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4"
                            key={classId}
                          >
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              {isEngaged ? 'Engaged' : 'Non-engaged'}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-100">{labels[classId]}</p>
                            <p className={`mt-3 text-3xl font-bold ${isEngaged ? 'text-emerald-300' : 'text-rose-300'}`}>{count}</p>
                          </div>
                        )
                      })
                  ) : (
                    <EmptyState text="No saved detections for this lecture yet. Upload a video to generate Mode A stats." />
                  )}
                </div>
              </Panel>
            </>
          ) : selectedClass?.isCompleted ? (
            // ============================================
            // MODE B: COMPLETED ASSESSMENT — STATS VIEW
            // ============================================
            <CompletedAssessmentView
              selectedClass={selectedClass}
              selectedCourse={selectedCourse}
            />
          ) : (
            // ============================================
            // MODE B: LIVE EXAM MONITOR
            // ============================================
            <ModeBContent
              liveAlerts={liveAlerts}
              modeBStatus={modeBStatus}
              isLiveMonitoring={isLiveMonitoring}
              isSaving={isSaving}
              selectedCourse={selectedCourse}
              selectedClass={selectedClass}
              notificationsOpen={notificationsOpen}
              setNotificationsOpen={setNotificationsOpen}
              selectedAlert={selectedAlert}
              recentAlertId={recentAlertId}
              setSelectedAlertId={setSelectedAlertId}
            />
          )}
        </main>
      </section>
    </div>
  )
}

// ─── Completed Assessment View ─────────────────────────────────────────────

function CompletedAssessmentView({ selectedClass, selectedCourse }) {
  const detections = selectedClass.detections || []
  const totalDetections = selectedClass.totalDetections || detections.length
  const integrityScore = Math.max(0, 100 - totalDetections * 5)

  const behaviorMix = useMemo(() => {
    if (totalDetections === 0) {
      return [{ label: 'Clean behavior', value: 100, color: '#10b981' }]
    }
    const cheatingPct = Math.min(100, totalDetections * 8)
    return [
      { label: 'Clean behavior', value: 100 - cheatingPct, color: '#10b981' },
      { label: 'Cheating alerts', value: cheatingPct, color: '#f43f5e' },
    ]
  }, [totalDetections])

  return (
    <>
      <section className="grid gap-6 md:grid-cols-3">
        <Metric label="Total detections" value={`${totalDetections}`} />
        <Metric label="Integrity score" value={`${integrityScore}%`} />
        <Metric label="Course" value={selectedCourse.code} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title={`${selectedClass.title} — Results`} subtitle={`${selectedClass.date} | Classroom: ${selectedClass.classroom || '—'}`}>
          <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
            <DonutChart
              centerLabel="integrity"
              data={behaviorMix}
              valueLabel={`${integrityScore}%`}
            />
          </div>
        </Panel>

        <Panel title="Alert trend" subtitle="Cheating detections over time">
          <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
            <LineChart
              color="#dc2626"
              data={selectedClass.trend || [{ label: '0s', value: 0 }]}
              yLabel="alert count"
            />
          </div>
        </Panel>
      </section>

      <Panel title="Evidence gallery" subtitle={`${detections.length} cheating snapshots saved`}>
        {detections.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detections.map((detection, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition hover:border-slate-600"
              >
                <div className="relative overflow-hidden bg-black">
                  <img
                    alt={`Detection at second ${detection.second}`}
                    className="h-48 w-full object-contain"
                    src={detection.imageUrl}
                    onError={(event) => {
                      event.currentTarget.src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="Arial" font-size="14">Image unavailable</text></svg>'
                    }}
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Second {detection.second}</span>
                    <span className="text-xs font-mono text-rose-400">
                      {Math.round((detection.confidence || 0) * 100)}% conf
                    </span>
                  </div>
                  {detection.time && (
                    <p className="mt-1 text-xs text-slate-500">{detection.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No cheating detections were recorded during this assessment." />
        )}
      </Panel>
    </>
  )
}

// ─── Shared components ─────────────────────────────────────────────────────

function Panel({ title, subtitle, children }) {
  return (
    <section className="card-rise rounded-[32px] border border-white/10 glass-panel p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Metric({ label, value, compact = false, compactDark = true }) {
  const baseClass = compactDark
    ? 'rounded-2xl border border-white/10 bg-slate-800/40 p-4 shadow-sm'
    : `rounded-2xl bg-slate-50 p-4 ${compact ? '' : 'border border-slate-100'}`

  return (
    <div className={baseClass}>
      <p className={`text-xs uppercase tracking-[0.24em] font-medium ${compactDark ? 'text-slate-400' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${compactDark ? 'text-white' : 'text-slate-950'}`}>
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 px-4 py-6 text-center text-sm leading-6 text-slate-400">
      {text}
    </div>
  )
}

function getModeBStatusLabel(status, isLiveMonitoring) {
  if (!isLiveMonitoring) return 'Feed paused'

  const labels = {
    idle: 'Waiting for simulation',
    connecting: 'Connecting to backend stream',
    started: 'Simulation started',
    running: 'Live simulation running',
    completed: 'Simulation completed',
    error: 'Simulation stream error',
  }

  return labels[status] || 'Live simulation running'
}

// ─── Mode B live monitoring component ──────────────────────────────────────

function ModeBContent({
  liveAlerts,
  modeBStatus,
  isLiveMonitoring,
  isSaving,
  selectedCourse,
  selectedClass,
  notificationsOpen,
  setNotificationsOpen,
  selectedAlert,
  recentAlertId,
  setSelectedAlertId,
}) {
  // Derive live metrics from alerts
  const liveIntegrity = Math.max(0, 100 - liveAlerts.length * 5)

  const liveBehaviorMix = useMemo(() => {
    if (liveAlerts.length === 0) {
      return [{ label: 'Clean behavior', value: 100, color: '#10b981' }]
    }
    const cheatingPct = Math.min(100, liveAlerts.length * 8)
    return [
      { label: 'Clean behavior', value: 100 - cheatingPct, color: '#10b981' },
      { label: 'Cheating alerts', value: cheatingPct, color: '#f43f5e' },
    ]
  }, [liveAlerts.length])

  const liveAlertTrend = useMemo(() => {
    if (liveAlerts.length === 0) {
      return [{ label: 'Start', value: 0 }]
    }
    // Group alerts by their `second` field into ~6 buckets
    const sorted = [...liveAlerts].reverse()
    const buckets = new Map()
    for (const alert of sorted) {
      const sec = parseInt(alert.seat?.replace('Second ', ''), 10) || 0
      const bucket = `${Math.floor(sec / 10) * 10}s`
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1)
    }
    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }))
  }, [liveAlerts])

  return (
    <>
      {isSaving && (
        <div className="rounded-[28px] border border-amber-500/30 bg-amber-900/20 p-6 text-center">
          <div className="inline-flex h-3 w-3 rounded-full bg-amber-400 soft-pulse" />
          <p className="mt-3 text-lg font-semibold text-amber-200">Saving assessment results...</p>
          <p className="mt-2 text-sm text-slate-400">Uploading evidence images to cloud storage. This may take a moment.</p>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Panel title="Live invigilation" subtitle="Exam mode active">
          <div className="rounded-[28px] bg-slate-900 border border-slate-700 p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Status</p>
                <p className="mt-2 text-2xl font-semibold">
                  {getModeBStatusLabel(modeBStatus, isLiveMonitoring)}
                </p>
              </div>
              <span
                className={`inline-flex h-3 w-3 rounded-full ${
                  modeBStatus === 'error' ? 'bg-rose-400' : 'soft-pulse bg-emerald-400'
                }`}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Metric label="Alerts received" value={`${liveAlerts.length}`} compactDark />
              <Metric label="Room" value={selectedCourse.room} compactDark />
              <Metric label="Mode" value="Exam live" compactDark />
            </div>

            <div className="loading-dots mt-8 text-sm text-slate-300">
              Streaming backend simulation and watching for cheating behavior (phone detection)
            </div>

            <button
              className="interactive mt-8 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              onClick={() => setNotificationsOpen((current) => !current)}
              type="button"
            >
              {notificationsOpen ? 'Hide notifications' : `Open notifications (${liveAlerts.length})`}
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

      <Panel title="Notifications" subtitle="Latest cheating alerts">
        <div className="space-y-3">
          {notificationsOpen ? (
            liveAlerts.length > 0 ? (
              liveAlerts.map((alert) => (
                <button
                  key={alert.id}
                  className={`interactive w-full rounded-3xl border px-4 py-4 text-left ${
                    selectedAlert?.id === alert.id
                      ? 'border-rose-500 bg-rose-900/20'
                      : 'border-slate-800 glass-panel hover:border-rose-800'
                  } ${alert.id === recentAlertId ? 'alert-fresh border-rose-400 bg-rose-900/40' : ''}`}
                  onClick={() => setSelectedAlertId(alert.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-200">{alert.studentName}</p>
                      <p className="mt-1 text-sm text-slate-400">Seat {alert.seat}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                      {alert.time}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-rose-400">{alert.message}</p>
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

      <section className="grid gap-6">
        <Panel title={`${selectedClass.title} overview`} subtitle={modeBStatus === 'completed' ? 'Simulation completed' : selectedClass.date}>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Integrity score" value={`${liveIntegrity}%`} />
            <Metric label="Alerts" value={`${liveAlerts.length}`} />
            <Metric label="Course" value={selectedCourse.code} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-200">Behavior mix</p>
              <div className="mt-5">
                <DonutChart
                  centerLabel="integrity"
                  data={liveBehaviorMix}
                  valueLabel={`${liveIntegrity}%`}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
              <p className="text-sm font-semibold text-slate-200">Alert trend</p>
              <div className="mt-5">
                <LineChart color="#dc2626" data={liveAlertTrend} yLabel="alert count" />
              </div>
            </div>
          </div>
        </Panel>
      </section>
    </>
  )
}

function EvidenceViewer({ alert, isFresh = false }) {
  return (
    <div className={`space-y-4 rounded-[28px] p-3 transition border border-transparent ${isFresh ? 'alert-evidence border-rose-500/30 bg-rose-900/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="overflow-hidden rounded-[24px] border border-slate-700 bg-black relative">
        <img
          alt={`Alert evidence for ${alert.studentName}`}
          className="h-[480px] w-full object-contain"
          onError={(event) => {
            event.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="Arial" font-size="36">Put cheating snapshot here</text></svg>'
          }}
          src={alert.evidenceImage}
        />
      </div>

      <div className={`rounded-2xl p-5 ${isFresh ? 'bg-slate-900/80' : 'glass-panel'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-100">{alert.studentName}</p>
            <p className="mt-1 text-sm text-slate-400">
              Seat {alert.seat} | {alert.classTitle}
            </p>
          </div>
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
            {alert.time}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-rose-300">{alert.message}</p>
      </div>
    </div>
  )
}
