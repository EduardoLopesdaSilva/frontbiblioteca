import type { SelectHTMLAttributes } from 'react'

type Option = { value: string; label: string }

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Option[]
  error?: string
  hint?: string
}

export default function Select({
  label,
  options,
  error,
  hint,
  id,
  className = '',
  ...props
}: Props) {
  const selectId = id ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`
  const describedBy = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        {...props}
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={[
          'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none',
          'transition focus:border-senai-blue focus:ring-2 focus:ring-senai-blue/20',
          error ? 'border-senai-red focus:border-senai-red focus:ring-senai-red/20' : 'border-slate-300',
          'disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs font-medium text-senai-red">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

