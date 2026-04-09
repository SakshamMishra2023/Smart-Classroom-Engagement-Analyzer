export function ModeSelection({ teacher, modes, onSelectMode, onLogout }) {
  return (
    <div className="page-enter mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">{teacher.school}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Choose an analysis mode
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Start from a clean entry point, then open a dedicated page for class-level
            analytics, video upload, and student-level insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Teacher</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{teacher.name}</p>
          </div>
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={onLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className="interactive group rounded-[32px] border border-white/60 bg-white/85 p-8 text-left shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(15,23,42,0.12)]"
            onClick={() => onSelectMode(mode.id)}
            type="button"
          >
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {mode.label}
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-slate-950">{mode.name}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              {mode.description}
            </p>
            <div className="mt-10 flex items-center justify-between">
              <span className="text-sm font-medium text-sky-700">Open workspace</span>
              <span className="text-2xl text-slate-300 transition group-hover:text-slate-500">
                {'->'}
              </span>
            </div>
          </button>
        ))}
      </section>
    </div>
  )
}
