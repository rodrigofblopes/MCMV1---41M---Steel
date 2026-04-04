import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import { AmostrasProvider } from './contexts/AmostrasContext.jsx'
import { EmpreendimentoProvider } from './contexts/EmpreendimentoContext.jsx'
import ApresentacaoCompleta from './pages/ApresentacaoCompleta.jsx'
import ProjetoLayout from './pages/ProjetoLayout.jsx'
import ProjetoPlanta from './pages/ProjetoPlanta.jsx'
import CustosLayout from './pages/CustosLayout.jsx'
import CustosProjeto from './pages/CustosProjeto.jsx'
import CustosSinapi from './pages/CustosSinapi.jsx'
import NovoCentroCusto from './pages/NovoCentroCusto.jsx'
import Viabilidade from './pages/Viabilidade.jsx'
import {
  apresentacao,
  calculadoraCub,
  custos,
  custosCub,
  custosNovo,
  projeto,
  projeto3d,
  viabilidade,
} from './routes/paths.js'
import { ViabilidadeCalcProvider } from './hooks/useViabilidadeCalcStorage.js'

const Apresentacao3D = lazy(() => import('./pages/Apresentacao3D.jsx'))

function CarregandoApresentacao() {
  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-[#d4d4d8] text-sm text-slate-600">
      Carregando apresentação 3D…
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ViabilidadeCalcProvider>
      <AmostrasProvider>
        <EmpreendimentoProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/apresentacao-investidor" replace />} />
                <Route path={projeto} element={<ProjetoLayout />}>
                  <Route index element={<Navigate to="planta" replace />} />
                  <Route path="planta" element={<ProjetoPlanta />} />
                  <Route
                    path="3d"
                    element={
                      <Suspense fallback={<CarregandoApresentacao />}>
                        <Apresentacao3D />
                      </Suspense>
                    }
                  />
                </Route>
                <Route path={apresentacao} element={<Navigate to={projeto3d} replace />} />
                <Route path="/apresentacao-investidor" element={<ApresentacaoCompleta />} />
                <Route path={viabilidade} element={<Viabilidade />} />
                <Route path={custos} element={<CustosLayout />}>
                  <Route index element={<Navigate to="cub" replace />} />
                  <Route path="cub" element={<CustosProjeto />} />
                  <Route path="sinapi" element={<CustosSinapi />} />
                  <Route path="novo" element={<NovoCentroCusto />} />
                </Route>
                <Route
                  path={calculadoraCub}
                  element={<Navigate to={`${custosCub}#cub-por-etapa`} replace />}
                />
              </Route>
              <Route path="*" element={<Navigate to="/apresentacao-investidor" replace />} />
            </Routes>
        </EmpreendimentoProvider>
      </AmostrasProvider>
      </ViabilidadeCalcProvider>
    </HashRouter>
  )
}
