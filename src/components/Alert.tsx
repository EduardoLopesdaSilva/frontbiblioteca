import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

export default function Alert({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'danger'
  title?: string
  children: React.ReactNode
}) {
  const styles =
    variant === 'danger'
      ? 'border-senai-red/30 bg-senai-red/10 text-senai-red'
      : 'border-senai-blue/30 bg-senai-blue/10 text-senai-blue'
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {variant === 'danger' ? (
            <FaExclamationTriangle aria-hidden="true" />
          ) : (
            <FaInfoCircle aria-hidden="true" />
          )}
        </div>
        <div className="text-sm">
          {title ? <div className="font-bold">{title}</div> : null}
          <div className="text-current/90">{children}</div>
        </div>
      </div>
    </div>
  )
}

