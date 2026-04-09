export function LineChart({ data, color = '#2563eb', yLabel }) {
  const width = 320
  const height = 180
  const padding = 20
  const max = Math.max(...data.map((item) => item.value), 100)
  const min = Math.min(...data.map((item) => item.value), 0)
  const range = max - min || 1

  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)
      const y = height - padding - ((item.value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
        <span>{yLabel}</span>
        <span>{data[data.length - 1]?.value}</span>
      </div>
      <svg className="h-52 w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3
          return (
            <line
              key={line}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 6"
            />
          )
        })}
        <polyline
          fill="none"
          points={points}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)
          const y = height - padding - ((item.value - min) / range) * (height - padding * 2)

          return <circle key={item.label} cx={x} cy={y} fill={color} r="4.5" />
        })}
      </svg>
      <div className="mt-3 grid grid-cols-6 text-xs text-slate-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
