/** Somente o controle (para cabeçalhos de seção no mapa). */
export function Interruptor({ id, checked, onChange, 'aria-label': ariaLabel }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B37E]',
        checked ? 'bg-[#00B37E]' : 'bg-slate-200',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

export default function Toggle({ id, checked, onChange, label, description }) {
  const lid = id ?? `toggle-${label?.replace(/\s/g, '-') ?? 'x'}`

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        {label ? (
          <label htmlFor={lid} className="text-sm font-medium text-[#1e293b]">
            {label}
          </label>
        ) : null}
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <Interruptor id={lid} checked={checked} onChange={onChange} aria-label={label} />
    </div>
  )
}
