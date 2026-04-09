export function BarChart({ data, valueSuffix = '%', color = 'bg-sky-500' }) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">
              {item.value}
              {valueSuffix}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div className={`h-3 rounded-full ${color}`} style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
