import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  onValueChange?: (value: string) => void
  mask?: (value: string) => string
}

export default function Input({
  label,
  error,
  hint,
  id,
  className = '',
  onChange,
  onValueChange,
  mask,
  ...props
}: Props) {
  const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(e) => {
          if (mask) e.currentTarget.value = mask(e.currentTarget.value)
          onValueChange?.(e.currentTarget.value)
          onChange?.(e)
        }}
        className={[
          'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none',
          'transition focus:border-senai-blue focus:ring-2 focus:ring-senai-blue/20',
          error ? 'border-senai-red focus:border-senai-red focus:ring-senai-red/20' : 'border-slate-300',
          'disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-senai-red">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

