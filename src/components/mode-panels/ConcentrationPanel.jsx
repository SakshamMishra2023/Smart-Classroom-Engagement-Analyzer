const toneClasses = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

export function ConcentrationPanel({ course, student }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Step 2 · Mode A
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Concentration profile for {student.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This mock view demonstrates how a teacher can inspect attention quality
              during a live class for {course.code}.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus score</p>
            <p className="mt-2 text-4xl font-semibold">{student.concentrationScore}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Activity distribution</h3>
          <div className="mt-5 space-y-4">
            {student.focusSignals.map((signal) => (
              <div key={signal.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{signal.label}</span>
                  <span className="text-slate-500">{signal.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${toneClasses[signal.tone]}`}
                    style={{ width: `${signal.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Instructor note</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Student is currently marked as <strong>{student.engagement}</strong>. This
              is where backend-driven camera inference summaries can later be plugged in.
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Focus timeline</h3>
          <div className="mt-5 space-y-4">
            {student.focusTimeline.map((event) => (
              <div
                key={`${event.time}-${event.title}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    {event.time}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {course.overview.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Class average
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
