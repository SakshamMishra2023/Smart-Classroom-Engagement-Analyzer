export function LineChart({ data = [], series, color = '#2563eb', yLabel }) {
  const width = 320
  const height = 180
  const padding = 20
  const chartSeries =
    series?.length > 0
      ? series
      : [
          {
            label: yLabel,
            color,
            data,
          },
        ]
  const labelData = chartSeries[0]?.data?.length ? chartSeries[0].data : data
  const values = chartSeries.flatMap((item) => item.data.map((point) => point.value))
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const getPointString = (seriesData) =>
    seriesData
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(seriesData.length - 1, 1)
      const y = height - padding - ((item.value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
        <span>{yLabel}</span>
        <span className="flex gap-3">
          {chartSeries.map((item) => (
            <span className="inline-flex items-center gap-1" key={item.label}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}: {item.data[item.data.length - 1]?.value ?? 0}
            </span>
          ))}
        </span>
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
        {chartSeries.map((item) => (
          <g key={item.label}>
            <polyline
              fill="none"
              points={getPointString(item.data)}
              stroke={item.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            {item.data.map((point, index) => {
              const x =
                padding + (index * (width - padding * 2)) / Math.max(item.data.length - 1, 1)
              const y = height - padding - ((point.value - min) / range) * (height - padding * 2)

              return (
                <circle
                  className="cursor-pointer transition-all hover:fill-amber-400"
                  cx={x}
                  cy={y}
                  fill={item.color}
                  key={`${item.label}-${point.label}`}
                  r="4.5"
                >
                  <title>
                    {point.label} {item.label}: {point.value}
                  </title>
                </circle>
              )
            })}
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {labelData.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
