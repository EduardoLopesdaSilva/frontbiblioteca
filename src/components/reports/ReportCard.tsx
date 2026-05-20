/** Card de métrica para dashboards administrativos. */
export default function ReportCard({
  title,
  value,
  hint,
  accent = 'blue',
}: {
  title: string
  value: string | number
  hint?: string
  accent?: 'blue' | 'red'
}) {
  const color = accent === 'red' ? 'text-senai-red' : 'text-senai-blue'
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</div>
      <div className={`mt-1 text-3xl font-extrabold ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-600">{hint}</div> : null}
    </div>
  )
}
