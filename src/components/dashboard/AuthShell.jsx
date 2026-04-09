import { useState } from 'react'

const benefits = [
  'Track concentration patterns like writing, reading, and attention drift.',
  'Switch to exam monitoring to surface suspicious glances and phone usage.',
  'Present live student cards, classroom summaries, and alert timelines.',
]

export function AuthShell({ onSubmit }) {
  const [mode, setMode] = useState('login')
  const [formState, setFormState] = useState({
    name: 'Dr. Meera Sharma',
    school: 'FutureTech Institute',
    email: 'meera@futuretech.edu',
    password: 'demo12345',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(formState)
  }

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.18),_transparent_30%)]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.16)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-slate-950 px-8 py-10 text-white sm:px-10">
          <div>
            <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
              Smart Classroom Student Analyzer
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Classroom analytics that help teachers respond in real time.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Use this frontend prototype to walk through login, course selection,
              concentration insights, and exam integrity monitoring without any backend.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
              >
                {benefit}
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-10 sm:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Teacher Access</p>
              <h2 className="mt-1 text-3xl font-semibold text-slate-900">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
            </div>

            <div className="rounded-full bg-slate-100 p-1 text-sm">
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setMode('login')}
                type="button"
              >
                Login
              </button>
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === 'signup'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setMode('signup')}
                type="button"
              >
                Sign up
              </button>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <Field
                  label="Teacher name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  value={formState.name}
                />
                <Field
                  label="Institution"
                  name="school"
                  onChange={handleChange}
                  placeholder="School or college name"
                  value={formState.school}
                />
              </>
            )}

            <Field
              label="Email"
              name="email"
              onChange={handleChange}
              placeholder="teacher@campus.edu"
              type="email"
              value={formState.email}
            />
            <Field
              label="Password"
              name="password"
              onChange={handleChange}
              placeholder="Enter password"
              type="password"
              value={formState.password}
            />

            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              {mode === 'login' ? 'Open dashboard' : 'Create account and continue'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              Demo Credentials
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Use the prefilled values to jump straight into the teacher workflow for your presentation.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        {...props}
      />
    </label>
  )
}
