import { useState } from 'react'

export function UploadAnalysisPage({
  course,
  mode,
  uploadedVideoName,
  onBack,
  onSubmit,
}) {
  const [formState, setFormState] = useState({
    lectureTitle: '',
    lectureDate: '',
    section: '',
    notes: '',
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsAnalyzing(true)
    setError('')

    try {
      await onSubmit(formState)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="card-rise rounded-[32px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              className="interactive rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              onClick={onBack}
              type="button"
            >
              Back to {mode.label}
            </button>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              Upload classroom video
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Add lecture details and submit the selected video. The backend extracts frames,
              calls Roboflow, stores the lecture, and returns class detection stats.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Selected context</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{course.title}</p>
            <p className="mt-1 text-sm text-slate-500">{mode.name}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field
              label="Lecture or exam name"
              name="lectureTitle"
              onChange={handleChange}
              placeholder="Example: Unit Test 2 - Section A"
              required
              value={formState.lectureTitle}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Date"
                name="lectureDate"
                onChange={handleChange}
                required
                type="date"
                value={formState.lectureDate}
              />
              <Field
                label="Section or room"
                name="section"
                onChange={handleChange}
                placeholder="Example: Section B / Smart Room 2"
                value={formState.section}
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                Notes for analysis
              </span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                name="notes"
                onChange={handleChange}
                placeholder="Optional instructions for later backend analysis, such as expected start time, camera angle, or exam rules."
                value={formState.notes}
              />
            </label>

            <button
              className="interactive w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!uploadedVideoName || isAnalyzing}
              type="submit"
            >
              {isAnalyzing ? 'Analyzing video...' : 'Run backend analysis'}
            </button>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </form>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Video file</p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {uploadedVideoName || 'No video selected'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose the video from the mode workspace first, then continue here to submit
                the analysis request with metadata.
              </p>
            </div>

            <div className="rounded-[28px] border border-sky-100 bg-sky-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Backend processing</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep this page open while the API samples one frame per second and saves
                the resulting lecture analysis in MongoDB.
              </p>
            </div>
          </div>
        </div>
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
