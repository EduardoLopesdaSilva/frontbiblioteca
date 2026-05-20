import type { ButtonHTMLAttributes } from 'react'
import { FaSpinner } from 'react-icons/fa'

type Variant = 'primary' | 'secondary' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-senai-blue text-white hover:bg-[#004C86] focus-visible:outline-senai-blue',
  secondary:
    'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger:
    'bg-senai-red text-white hover:bg-[#C00510] focus-visible:outline-senai-red',
}

export default function Button({
  className = '',
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props
}: Props) {
  const isDisabled = disabled || loading
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold',
        'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        className,
      ].join(' ')}
    >
      {loading ? <FaSpinner className="animate-spin" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
}

