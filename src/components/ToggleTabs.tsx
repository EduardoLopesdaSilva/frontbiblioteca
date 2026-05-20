import type { Dispatch, SetStateAction } from 'react'

type Tab<T extends string> = {
  key: T
  label: string
  description?: string
}

type ToggleTabsOnChange<T extends string> = ((value: T) => void) | Dispatch<SetStateAction<T>>

export default function ToggleTabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T
  onChange: ToggleTabsOnChange<T>
  tabs: Tab<T>[]
}) {
  return (
    <div className="w-full">
      <div className="inline-flex w-full rounded-lg bg-slate-100 p-1">
        {tabs.map((t) => {
          const active = t.key === value
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={[
                'flex-1 rounded-md px-3 py-2 text-left text-sm font-semibold transition',
                active ? 'bg-white text-senai-blue shadow-sm' : 'text-slate-700 hover:bg-white/60',
              ].join(' ')}
              aria-pressed={active}
            >
              <div>{t.label}</div>
              {t.description ? (
                <div className="mt-0.5 text-xs font-normal text-slate-600">{t.description}</div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

