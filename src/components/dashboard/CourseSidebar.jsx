export function CourseSidebar({
  courses,
  selectedCourseId,
  selectedMode,
  teacher,
  onCourseChange,
  onModeChange,
  modeOptions,
  onLogout,
}) {
  return (
    <aside className="w-full rounded-[32px] border border-slate-900/5 bg-slate-950 p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] lg:max-w-sm">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          Teacher Console
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{teacher.name}</h2>
        <p className="mt-1 text-sm text-slate-300">{teacher.school}</p>
        <button
          className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          onClick={onLogout}
          type="button"
        >
          Sign out
        </button>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          Workflow
        </p>
        <div className="mt-3 grid gap-3">
          {modeOptions.map((mode) => (
            <button
              key={mode.id}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                selectedMode === mode.id
                  ? 'border-sky-400 bg-sky-400/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              }`}
              onClick={() => onModeChange(mode.id)}
              type="button"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{mode.label}</p>
              <p className="mt-2 text-base font-semibold">{mode.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          Courses
        </p>
        <div className="mt-3 grid gap-3">
          {courses.map((course) => (
            <button
              key={course.id}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                selectedCourseId === course.id
                  ? 'border-amber-300 bg-amber-300/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              }`}
              onClick={() => onCourseChange(course.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{course.code}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                  {course.liveStatus}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{course.schedule}</p>
              <p className="mt-1 text-sm text-slate-400">{course.room}</p>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
