export function ModeSelection({ teacher, modes, onSelectMode, onLogout }) {
  return (
    <div className="page-enter mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 glass-panel p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-400">{teacher.school}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Choose an analysis mode
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Start from a clean entry point, then open a dedicated page for class-level
            analytics, video upload, and student-level insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-800/50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Teacher</p>
            <p className="mt-1 text-sm font-semibold text-slate-200">{teacher.name}</p>
          </div>
          <button
            className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
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
            className="interactive group rounded-[32px] border border-white/10 glass-panel p-8 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl hover:border-slate-500"
            onClick={() => onSelectMode(mode.id)}
            type="button"
          >
            <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              {mode.label}
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-white">{mode.name}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
              {mode.description}
            </p>
            <div className="mt-10 flex items-center justify-between">
              <span className="text-sm font-medium text-sky-400">Open workspace</span>
              <span className="text-2xl text-slate-500 transition group-hover:text-slate-300">
                {'->'}
              </span>
            </div>
          </button>
        ))}
      </section>
    </div>
  )
}

