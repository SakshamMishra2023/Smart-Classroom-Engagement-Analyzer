const toneMap = {
  sky: 'from-sky-500/15 to-sky-100 border-sky-200/70',
  amber: 'from-amber-500/15 to-amber-100 border-amber-200/70',
  emerald: 'from-emerald-500/15 to-emerald-100 border-emerald-200/70',
  rose: 'from-rose-500/15 to-rose-100 border-rose-200/70',
}

export function StatCard({ label, value, tone = 'sky' }) {
  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${toneMap[tone] ?? toneMap.sky}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
