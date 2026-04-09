export function DonutChart({ data, valueLabel, centerLabel }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1

  const segments = data.map((item, index) => {
    const startValue = data
      .slice(0, index)
      .reduce((sum, current) => sum + current.value, 0)
    const endValue = startValue + item.value
    const start = startValue / total
    const end = endValue / total

    return {
      ...item,
      dasharray: `${(end - start) * 282.6} 282.6`,
      dashoffset: `${-start * 282.6}`,
    }
  })

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-48 w-48">
        <svg className="h-48 w-48 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" fill="none" r="45" stroke="#e2e8f0" strokeWidth="12" />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx="60"
              cy="60"
              fill="none"
              r="45"
              stroke={segment.color}
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.dashoffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {centerLabel}
          </span>
          <span className="mt-2 text-3xl font-semibold text-slate-950">{valueLabel}</span>
        </div>
      </div>

      <div className="grid w-full gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <span className="font-medium text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
