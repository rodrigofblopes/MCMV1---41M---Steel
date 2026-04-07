import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { custosCub, custosSinapi } from '../routes/paths.js'

function subTabClass(active) {
  return [
    'inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:px-4',
    active
      ? 'bg-sky-100 text-sky-900 shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
  ].join(' ')
}

export default function CustosLayout() {
  const { pathname } = useLocation()
  const emNovoCentro = pathname.includes('/custos/novo')

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f0f4f8]">
      {!emNovoCentro ? (
        <div className="shrink-0 border-b border-slate-200 bg-white px-2 py-2 sm:px-5 sm:py-2.5">
          <nav
            className="mx-auto flex max-w-7xl snap-x snap-mandatory items-center gap-2 overflow-x-auto overscroll-x-contain scroll-py-2 px-1 text-sm text-slate-500 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Fonte de custos"
          >
            <span className="hidden shrink-0 font-medium sm:inline">Custos</span>
            <span className="hidden shrink-0 text-slate-300 sm:inline" aria-hidden>
              /
            </span>
            <div className="flex shrink-0 gap-2">
              <NavLink
                to={custosCub}
                end
                className={({ isActive }) =>
                  [subTabClass(isActive), 'inline-flex min-h-[44px] snap-start items-center sm:min-h-0'].join(' ')
                }
              >
                CUB
              </NavLink>
              <NavLink
                to={custosSinapi}
                className={({ isActive }) =>
                  [subTabClass(isActive), 'inline-flex min-h-[44px] snap-start items-center sm:min-h-0'].join(' ')
                }
              >
                SINAPI
              </NavLink>
            </div>
          </nav>
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
