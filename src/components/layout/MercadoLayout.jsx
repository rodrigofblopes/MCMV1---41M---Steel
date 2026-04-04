import { Outlet } from 'react-router-dom'
import { NovaAmostraModalProvider } from '../../contexts/NovaAmostraModalContext.jsx'
import NovaAmostraModal from '../map/NovaAmostraModal.jsx'
import MercadoSubTabs from './MercadoSubTabs.jsx'

export default function MercadoLayout() {
  return (
    <NovaAmostraModalProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MercadoSubTabs />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
        <NovaAmostraModal />
      </div>
    </NovaAmostraModalProvider>
  )
}
