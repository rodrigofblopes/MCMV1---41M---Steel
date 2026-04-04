import { NavLink, Outlet } from 'react-router-dom'
import { projeto3d, projetoPlanta } from '../routes/paths.js'

function subTabClass(active) {
  return [
    'inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors sm:px-4',
    active
      ? 'bg-violet-100 text-violet-800 shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
  ].join(' ')
}

export default function ProjetoLayout() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="shrink-0 border-b border-slate-200 bg-white px-2 py-2 sm:px-5 sm:py-2.5">
        <nav
          className="mx-auto flex max-w-7xl gap-2 overflow-x-auto overscroll-x-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          aria-label="Secções do projeto"
        >
          <NavLink
            to={projetoPlanta}
            end
            className={({ isActive }) =>
              [subTabClass(isActive), 'shrink-0 min-h-[44px] items-center sm:min-h-0'].join(' ')
            }
          >
            Planta baixa
          </NavLink>
          <NavLink
            to={projeto3d}
            className={({ isActive }) => [subTabClass(isActive), 'shrink-0 min-h-[44px] items-center sm:min-h-0'].join(' ')}
          >
            3D
          </NavLink>
        </nav>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
