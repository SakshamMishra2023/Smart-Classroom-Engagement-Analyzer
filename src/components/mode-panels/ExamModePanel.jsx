export function ExamModePanel({ course, student }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-rose-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
          Step 2 · Mode B
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Exam integrity monitor for {student.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This screen shows the alert-driven workflow for spotting suspicious behavior,
              including gaze deviation and mobile phone detection.
            </p>
          </div>

          <div className="rounded-3xl bg-rose-600 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-100">Risk score</p>
            <p className="mt-2 text-4xl font-semibold">{student.examMetrics.riskScore}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Alert count" value={student.examMetrics.alertCount} />
        <MetricCard label="Gaze deviation" value={student.examMetrics.gazeDeviation} />
        <MetricCard label="Device probability" value={student.examMetrics.deviceProbability} />
        <MetricCard label="Current risk" value={student.riskLevel} />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Alert timeline</h3>
          <div className="mt-5 space-y-4">
            {student.examAlerts.length > 0 ? (
              student.examAlerts.map((alert) => (
                <div
                  key={`${alert.time}-${alert.message}`}
                  className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{alert.message}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      {alert.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-rose-600">Severity: {alert.severity}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
                No suspicious activity has been detected for this student in the current mock session.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Classroom watchlist</h3>
          <div className="mt-5 space-y-3">
            {course.students
              .slice()
              .sort((left, right) => right.examMetrics.riskScore - left.examMetrics.riskScore)
              .map((learner) => (
                <div
                  key={learner.id}
                  className={`rounded-3xl border px-4 py-4 ${
                    learner.id === student.id
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{learner.name}</p>
                      <p
                        className={`mt-1 text-sm ${
                          learner.id === student.id ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        Seat {learner.seat} • {learner.riskLevel} risk
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        learner.id === student.id
                          ? 'bg-white/10 text-white'
                          : 'bg-white text-slate-700'
                      }`}
                    >
                      {learner.examMetrics.riskScore}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
