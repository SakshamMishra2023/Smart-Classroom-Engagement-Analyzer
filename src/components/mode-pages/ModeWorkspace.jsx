import { useState, useMemo } from 'react'
import { DonutChart } from '../charts/DonutChart'
import { LineChart } from '../charts/LineChart'
import { LiveFeedOverlay } from '../feed/LiveFeedOverlay'
import { MOCK_DETECTION_PAYLOAD, computeZoneAnalytics, getActionColor, getActionLabel } from '../../services/MockRoboflowService'

export function ModeWorkspace({
  teacher,
  mode,
  courses,
  selectedCourseId,
  selectedClassId,
  searchTerm,
  liveAlerts,
  isLiveMonitoring,
  recentAlertId,
  onBack,
  onLogout,
  onCourseChange,
  onClassChange,
  onVideoPick,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0]
  
  // Guard against missing modeData
  const modeData = selectedCourse.modes[mode.id]
  if (!modeData) return <div className="text-white p-8">Loading mode data...</div>

  const selectedClass = modeData.classes.find((item) => item.id === selectedClassId) ?? modeData.classes[0]

  // --- Spatial Post-Analysis Setup ---
  const isConcentrationMode = mode.id === 'concentration'
  const livePredictions = isConcentrationMode ? MOCK_DETECTION_PAYLOAD.predictions : []
  
  const { zones, commentary, worstZone } = useMemo(() => {
    return computeZoneAnalytics(livePredictions)
  }, [livePredictions])

  let totalDets = 0
  let totalEngaged = 0
  Object.values(zones).forEach(z => {
    totalDets += z.total
    totalEngaged += z.engaged
  })
  const liveEngagementScore = totalDets > 0 ? Math.round((totalEngaged / totalDets) * 100) : 0

  const getZoneColorClass = (score) => {
    if (score >= 80) return 'border-emerald-500/50 bg-emerald-900/20 text-emerald-300 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)]'
    if (score >= 60) return 'border-amber-500/50 bg-amber-900/20 text-amber-300 shadow-[inset_0_0_20px_rgba(245,158,11,0.15)]'
    return 'border-rose-500/50 bg-rose-900/20 text-rose-300 shadow-[inset_0_0_20px_rgba(225,29,72,0.2)]'
  }

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

          <Panel title="Lecture Analysis">
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
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.attendance} present</span>
                    <span className={selectedClassId === item.id ? 'text-emerald-400 font-bold' : ''}>{item.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {isConcentrationMode && (
            <Panel title="Upload New">
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Course Code (e.g., CS101)" 
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
                />
                <label className="interactive flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/30 px-5 py-8 text-center transition hover:border-slate-500 hover:bg-slate-800">
                  <span className="text-sm font-medium text-slate-200">Analyze Video</span>
                  <span className="mt-2 text-sm leading-6 text-slate-400">
                    Upload a classroom recording to generate a new post-lecture analytics report.
                  </span>
                  <input className="hidden" onChange={onVideoPick} type="file" />
                  <span className="mt-5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">
                    Upload file
                  </span>
                </label>
              </div>
            </Panel>
          )}
        </aside>

        <main className="space-y-6">
          {isConcentrationMode ? (
            <>
              {/* Top Highlights */}
              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_2fr]">
                <div className="card-rise rounded-[32px] border border-white/10 glass-panel p-8 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <svg className="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.06 19.43 4 16.05 4 12C4 7.95 7.06 4.57 11 4.07V19.93ZM13 4.07C16.94 4.57 20 7.95 20 12C20 16.05 16.94 19.43 13 19.93V4.07Z"/></svg>
                   </div>
                   <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Overall Engagement</p>
                   <p className="text-7xl font-bold bg-gradient-to-br from-emerald-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">{liveEngagementScore}%</p>
                   <p className="mt-4 text-sm text-slate-300">Based on frame-by-frame analysis of {totalDets} action data points.</p>
                </div>

                <div className="card-rise rounded-[32px] border border-white/10 glass-panel p-8 shadow-2xl flex flex-col">
                   <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Classroom Spatial Map</p>
                   <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1">
                      <div className={`rounded-xl border flex flex-col items-center justify-center p-4 transition-all ${getZoneColorClass(zones['Back Left'].score)}`}>
                         <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Back Left</p>
                         <p className="text-2xl font-bold font-mono">{zones['Back Left'].score}%</p>
                      </div>
                      <div className={`rounded-xl border flex flex-col items-center justify-center p-4 transition-all ${getZoneColorClass(zones['Back Right'].score)}`}>
                         <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Back Right</p>
                         <p className="text-2xl font-bold font-mono">{zones['Back Right'].score}%</p>
                      </div>
                      <div className={`rounded-xl border flex flex-col items-center justify-center p-4 transition-all ${getZoneColorClass(zones['Front Left'].score)}`}>
                         <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Front Left</p>
                         <p className="text-2xl font-bold font-mono">{zones['Front Left'].score}%</p>
                      </div>
                      <div className={`rounded-xl border flex flex-col items-center justify-center p-4 transition-all ${getZoneColorClass(zones['Front Right'].score)}`}>
                         <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Front Right</p>
                         <p className="text-2xl font-bold font-mono">{zones['Front Right'].score}%</p>
                      </div>
                   </div>
                   <div className="mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                      <p className="text-sm italic text-slate-300">" {commentary} "</p>
                   </div>
                </div>
              </section>

              <section className="grid gap-6">
                <Panel title="Lecture Engagement Timeline" subtitle="Focus level throughout the 60-minute session">
                  <div className="h-64 mt-4 relative">
                    <LineChart color="#38bdf8" data={chartData} yLabel="class-wide focus %" />
                    <div className="absolute top-0 right-0 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur">
                       <p className="text-xs text-slate-400">Peak Focus: <span className="text-sky-400 font-bold ml-1">{Math.max(...chartData.map(d=>d.value))}%</span></p>
                       <p className="text-xs text-slate-400 mt-1">Lowest Drop: <span className="text-rose-400 font-bold ml-1">{Math.min(...chartData.map(d=>d.value))}%</span></p>
                    </div>
                  </div>
                </Panel>
              </section>

              <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                 <Panel title="Action Feed Snapshot" subtitle="Detected physical behaviors at peak distraction">
                    <LiveFeedOverlay predictions={livePredictions} />
                 </Panel>

                 <Panel title="Estimated Attendance">
                  <div className="flex flex-col items-center justify-center h-full space-y-4 px-2 py-4">
                    <p className="text-sm text-slate-400 text-center">Headcount derived from upper-bound detection peaks across analyzed frames.</p>
                    <div className="w-40 h-40 rounded-full border-[8px] border-emerald-500/20 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold bg-gradient-to-br from-emerald-300 to-sky-300 bg-clip-text text-transparent">{totalDets}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-500 mt-1">Students</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center text-xs text-slate-400">
                        <span className="block text-emerald-400 font-bold mb-1">Methodology</span>
                        The model cannot identify individuals. Attendance is an automated upper-bound estimate mapped from anonymous figure detection.
                    </div>
                  </div>
                </Panel>
              </section>
            </>
          ) : (
            // ============================================
            // MODE B: EXAM MONITOR
            // ============================================
            <>
              <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <Panel title="Live invigilation" subtitle="Exam mode active">
                  <div className="rounded-[28px] bg-slate-900 border border-slate-700 p-6 text-white">
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
                <Panel title={`${selectedClass.title} overview`} subtitle={selectedClass.date}>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Metric label="Integrity score" value={`${selectedClass.engagement}%`} />
                    <Metric label="Attendance" value={`${selectedClass.attendance}`} />
                    <Metric label="Course" value={selectedCourse.code} />
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
                      <p className="text-sm font-semibold text-slate-200">Behavior mix</p>
                      <div className="mt-5">
                        <DonutChart
                          centerLabel="integrity"
                          data={selectedClass.summaryStats}
                          valueLabel={`${selectedClass.engagement}%`}
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
                      <p className="text-sm font-semibold text-slate-200">Alert trend</p>
                      <div className="mt-5">
                        <LineChart color="#dc2626" data={selectedClass.trend} yLabel="alert frequency" />
                      </div>
                    </div>
                  </div>
                </Panel>
              </section>
            </>
          )}
        </main>
      </section>
    </div>
  )
}

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

function EvidenceViewer({ alert, isFresh = false }) {
  return (
    <div className={`space-y-4 rounded-[28px] p-3 transition border border-transparent ${isFresh ? 'alert-evidence border-rose-500/30 bg-rose-900/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <div className="overflow-hidden rounded-[24px] border border-slate-700 bg-black relative">
        <img
          alt={`Alert evidence for ${alert.studentName}`}
          className="h-80 w-full object-contain"
          onError={(event) => {
            event.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="Arial" font-size="36">Put cheating snapshot here</text></svg>'
          }}
          src={alert.evidenceImage}
        />
        <div className="absolute top-[30%] left-[40%] w-[120px] h-[150px] border-2 border-rose-500 rounded flex items-start">
           <span className="bg-rose-500 text-white text-[10px] font-bold px-1 m-[-2px] uppercase">Gaze Deviated</span>
        </div>
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
