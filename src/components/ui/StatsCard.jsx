const BRAND_BORDER = 'border-[#00B37E]'

export default function StatsCard({
  titulo,
  valor,
  destaque = false,
  icone,
  iconeEsquerda,
  grande = false,
  className = '',
  /** Card verde cheio com texto claro (topo do dashboard). */
  variant = 'default',
}) {
  const hero = variant === 'hero'

  return (
    <div
      className={[
        'relative shadow-sm',
        hero ? 'rounded-2xl' : 'rounded-xl',
        grande ? 'p-6 sm:p-7' : 'p-5',
        hero
          ? 'border-0 bg-[#00B37E] text-white'
          : [
              'bg-white',
              destaque ? `border-2 ${BRAND_BORDER}` : 'border border-slate-200/90',
            ].join(' '),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {iconeEsquerda ? (
        <div className="absolute left-4 top-4 text-slate-400" aria-hidden>
          {iconeEsquerda}
        </div>
      ) : null}
      {icone ? (
        <div
          className={[
            'absolute right-4 top-4',
            hero ? 'text-white/80' : 'text-slate-400',
          ].join(' ')}
        >
          {icone}
        </div>
      ) : null}
      <p
        className={[
          'font-medium',
          iconeEsquerda ? 'pl-10' : '',
          icone ? 'pr-10' : '',
          hero ? 'text-sm text-white/90' : ['text-slate-600', grande ? 'text-base' : 'text-sm'].join(' '),
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {titulo}
      </p>
      <p
        className={[
          'mt-2 font-semibold tracking-tight',
          hero
            ? 'text-[1.65rem] text-white sm:text-4xl md:text-5xl'
            : ['text-[#1e293b]', grande ? 'text-3xl sm:text-4xl' : 'text-2xl'].join(' '),
        ].join(' ')}
      >
        {valor}
      </p>
    </div>
  )
}
