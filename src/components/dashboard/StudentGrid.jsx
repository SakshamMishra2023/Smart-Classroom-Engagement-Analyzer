export function StudentGrid({
  course,
  students,
  totalStudents,
  selectedStudentId,
  searchTerm,
  onSearchChange,
  onStudentSelect,
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Step 1
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Select students</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {course.attendance} students present. Choose a learner to view detailed analytics.
          </p>
        </div>

        <label className="block w-full sm:max-w-xs">
          <span className="mb-2 block text-sm font-medium text-slate-500">Search roster</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name, roll number, seat"
            value={searchTerm}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        {students.map((student) => (
          <button
            key={student.id}
            className={`rounded-3xl border px-4 py-4 text-left transition ${
              selectedStudentId === student.id
                ? 'border-slate-950 bg-slate-950 text-white shadow-lg'
                : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm'
            }`}
            onClick={() => onStudentSelect(student.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{student.name}</p>
                <p
                  className={`mt-1 text-sm ${
                    selectedStudentId === student.id ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {student.rollNumber} • Seat {student.seat}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedStudentId === student.id
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {student.concentrationScore}% focus
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full px-3 py-1 ${
                  selectedStudentId === student.id
                    ? 'bg-emerald-400/15 text-emerald-200'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {student.engagement}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${
                  selectedStudentId === student.id
                    ? 'bg-amber-400/15 text-amber-100'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                Exam risk: {student.riskLevel}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Showing {students.length} of {totalStudents} students.
      </div>
    </section>
  )
}
