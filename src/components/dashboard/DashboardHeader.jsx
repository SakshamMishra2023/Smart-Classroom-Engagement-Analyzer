import { StatCard } from './StatCard'

export function DashboardHeader({ course, mode, teacher, modeOptions, onModeChange }) {
  return (
    <section>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">Welcome, {teacher.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Move through your presentation workflow: teacher login, course selection,
            student roster, then {mode.name.toLowerCase()} with live mock insights.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {modeOptions.map((option) => (
            <button
              key={option.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode.id === option.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => onModeChange(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Classroom" value={course.room} tone="sky" />
        <StatCard label="Schedule" value={course.schedule} tone="amber" />
        <StatCard
          label="Avg Concentration"
          value={`${course.concentrationAverage}%`}
          tone="emerald"
        />
        <StatCard label="Integrity Index" value={`${course.integrityIndex}%`} tone="rose" />
      </div>
    </section>
  )
}
