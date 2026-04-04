import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROTULO_PROJETO_COM_AREA } from '../../constants/areaProjeto.js'
import { custosCub, projetoPlanta, viabilidade } from '../../routes/paths.js'

function tabClass(active, variant) {
  const base =
    'inline-flex items-center border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4'
  const variants = {
    projeto: active
      ? 'border-violet-500 text-violet-700'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-[#1e293b]',
    mercado: active
      ? 'border-[#00B37E] text-[#00B37E]'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-[#1e293b]',
    viabilidade: active
      ? 'border-amber-600 text-amber-900'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-[#1e293b]',
    custos: active
      ? 'border-sky-600 text-sky-800'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-[#1e293b]',
  }
  return [base, variants[variant]].join(' ')
}

function IconProjeto({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 20V10l8-5 8 5v10" />
      <path d="M12 15v5" />
      <path d="M8 20h8" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" />
    </svg>
  )
}

function IconMercado({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3v18h18" />
      <path d="M7 16V9" />
      <path d="M12 16v-5" />
      <path d="M17 16V6" />
    </svg>
  )
}

function IconViabilidade({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h5M8 14h8" />
    </svg>
  )
}

function IconCustos({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function tituloSecaoMobile(pathname) {
  if (pathname.startsWith('/projeto')) {
    if (pathname.endsWith('/3d') || pathname.endsWith('/3d/')) return 'Projeto · 3D'
    return 'Projeto · Planta baixa'
  }
  if (pathname === '/apresentacao-investidor') return 'Pesquisa'
  if (pathname === viabilidade) return 'Viabilidade'
  if (pathname.startsWith('/custos')) {
    if (pathname === '/custos/novo' || pathname.endsWith('/novo')) return 'Novo centro de custo'
    if (pathname.includes('/sinapi')) return 'Custos · SINAPI'
    return 'Custos · CUB'
  }
  return ROTULO_PROJETO_COM_AREA
}

function mobileNavItemClass(isActive, tone) {
  const tones = {
    violet: isActive ? 'text-violet-600 bg-violet-50' : 'text-slate-500 active:bg-slate-100',
    emerald: isActive ? 'text-[#00B37E] bg-emerald-50' : 'text-slate-500 active:bg-slate-100',
    amber: isActive ? 'text-amber-700 bg-amber-50' : 'text-slate-500 active:bg-slate-100',
    sky: isActive ? 'text-sky-700 bg-sky-50' : 'text-slate-500 active:bg-slate-100',
  }
  return [
    'flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors active:opacity-90 motion-safe:active:scale-[0.97]',
    tones[tone],
  ].join(' ')
}

export default function ProductTabs() {
  const { pathname } = useLocation()
  const subtitulo = tituloSecaoMobile(pathname)
  const projetoAtivo = pathname.startsWith('/projeto')
  const custosAtivo = pathname.startsWith('/custos')

  return (
    <Fragment>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] md:hidden">
          <span className="max-w-[48%] shrink-0 truncate text-sm font-bold tracking-tight text-slate-900">
            {ROTULO_PROJETO_COM_AREA}
          </span>
          <span
            className="min-w-0 max-w-[52%] truncate text-right text-[11px] font-semibold leading-snug text-slate-600"
            title={subtitulo}
          >
            {subtitulo}
          </span>
        </div>

        <nav
          className="mx-auto hidden max-w-7xl flex-wrap gap-x-1 gap-y-0 px-3 sm:px-5 md:flex"
          aria-label="Estrutura do produto"
        >
          <NavLink
            to={projetoPlanta}
            className={() => tabClass(projetoAtivo, 'projeto')}
          >
            Projeto
          </NavLink>
          <NavLink
            to="/apresentacao-investidor"
            className={() => tabClass(pathname === '/apresentacao-investidor', 'mercado')}
          >
            Pesquisa
          </NavLink>
          <NavLink
            to={viabilidade}
            end
            className={() => tabClass(pathname === viabilidade, 'viabilidade')}
          >
            Viabilidade
          </NavLink>
          <NavLink to={custosCub} className={() => tabClass(custosAtivo, 'custos')}>
            Custos
          </NavLink>
        </nav>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-4 border-t border-slate-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
        aria-label="Navegação principal"
      >
        <NavLink to={projetoPlanta} className={() => mobileNavItemClass(projetoAtivo, 'violet')}>
          <IconProjeto className="h-6 w-6 shrink-0 stroke-[1.75]" aria-hidden />
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold leading-tight">
            Projeto
          </span>
        </NavLink>
        <NavLink
          to="/apresentacao-investidor"
          className={({ isActive }) => mobileNavItemClass(isActive, 'emerald')}
        >
          <IconMercado className="h-6 w-6 shrink-0 stroke-[1.75]" aria-hidden />
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold leading-tight">
            Pesquisa
          </span>
        </NavLink>
        <NavLink
          to={viabilidade}
          end
          className={({ isActive }) => mobileNavItemClass(isActive, 'amber')}
        >
          <IconViabilidade className="h-6 w-6 shrink-0 stroke-[1.75]" aria-hidden />
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold leading-tight">
            Viab.
          </span>
        </NavLink>
        <NavLink to={custosCub} className={() => mobileNavItemClass(custosAtivo, 'sky')}>
          <IconCustos className="h-6 w-6 shrink-0 stroke-[1.75]" aria-hidden />
          <span className="max-w-full truncate px-0.5 text-center text-[11px] font-semibold leading-tight">
            Custos
          </span>
        </NavLink>
      </nav>
    </Fragment>
  )
}
