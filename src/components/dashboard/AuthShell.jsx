import { useState } from 'react'

const benefits = [
  'Track concentration patterns like writing, reading, and attention drift.',
  'Switch to exam monitoring to surface suspicious glances and phone usage.',
  'Present live student cards, classroom summaries, and alert timelines.',
]

export function AuthShell({ error, isSubmitting = false, onSubmit }) {
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
    onSubmit({ ...formState, authMode: mode })
  }

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-[#0B1120]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.15),_transparent_30%)]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-700 glass-panel shadow-[0_30px_120px_rgba(0,0,0,0.5)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-slate-900/50 px-8 py-10 text-white sm:px-10">
          <div>
            <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              Smart Classroom Analyzer
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl text-white">
              Classroom analytics that help teachers respond in real time.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Sign in to load your saved MongoDB courses, lecture stats, and Mode A
              video analysis results.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-slate-700 bg-slate-800/40 px-4 py-4 text-sm text-slate-300"
              >
                {benefit}
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-10 sm:px-10 bg-slate-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Teacher Access</p>
              <h2 className="mt-1 text-3xl font-semibold text-white">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
            </div>

            <div className="rounded-full bg-slate-800 p-1 text-sm border border-slate-700">
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === 'login'
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setMode('login')}
                type="button"
              >
                Login
              </button>
              <button
                className={`rounded-full px-4 py-2 transition ${
                  mode === 'signup'
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
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

            {error ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-sky-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? 'Connecting...'
                : mode === 'login'
                  ? 'Open dashboard'
                  : 'Create account and continue'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              Demo Credentials
            </p>
            <p className="mt-3 text-sm text-slate-400">
              If this is your first run, switch to sign up. The backend will create
              your teacher account and attach demo courses for Mode A.
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
      <span className="mb-2 block text-sm font-medium text-slate-400">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        {...props}
      />
    </label>
  )
}
