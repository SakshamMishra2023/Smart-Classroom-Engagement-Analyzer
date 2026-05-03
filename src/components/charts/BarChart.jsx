export function BarChart({ data, valueSuffix = '%', color = 'bg-sky-500', maxValue = 100 }) {
  const scale = Math.max(maxValue, ...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">{item.label}</span>
            <span className="font-medium text-slate-100">
              {item.value}
              {valueSuffix}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-700">
            <div
              className={`h-3 rounded-full ${color}`}
              style={{ width: `${Math.max(4, (item.value / scale) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
