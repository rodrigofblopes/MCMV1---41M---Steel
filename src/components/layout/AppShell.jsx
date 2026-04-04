import { Outlet } from 'react-router-dom'
import ProductTabs from './ProductTabs.jsx'

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f3f4f6] pb-[calc(4.25rem+max(12px,env(safe-area-inset-bottom,0px)))] md:pb-0">
      <ProductTabs />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
