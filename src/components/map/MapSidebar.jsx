import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNovaAmostraModalOptional } from '../../contexts/NovaAmostraModalContext.jsx'
import { empreendimento } from '../../routes/paths.js'
import Toggle, { Interruptor } from '../ui/Toggle.jsx'

function EyeIcon({ off }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={off ? 'text-slate-300' : 'text-slate-600'}
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <line x1="4" y1="4" x2="20" y2="20" /> : null}
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function Chevron({ aberto }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={['text-slate-500 transition-transform', aberto ? 'rotate-180' : ''].join(' ')}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinhaSecao({ titulo, aberto, onAlternar, interruptor }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0">
      <button
        type="button"
        onClick={() => onAlternar(!aberto)}
        className="flex flex-1 items-center gap-2 text-left"
        aria-expanded={aberto}
      >
        <Chevron aberto={aberto} />
        <span className="text-sm font-medium text-[#1e293b]">{titulo}</span>
      </button>
      <div className="shrink-0">{interruptor}</div>
    </div>
  )
}

export default function MapSidebar({
  camadaTerreno,
  onCamadaTerreno,
  camadaPrecos,
  onCamadaPrecos,
  camadaServicos,
  onCamadaServicos,
  amostras,
  visivelPorId,
  onToggleVisivelAmostra,
  alcanceTerrenos,
  onAlcanceTerrenos,
  mostrarNomes,
  onMostrarNomes,
  mostrarNomesCompletos,
  onMostrarNomesCompletos,
  /** Remove a amostra do portfólio (com confirmação). */
  onRemoverAmostra,
  /** Modo apresentação: sem cadastros nem menu de exclusão nas amostras. */
  somenteLeitura = false,
}) {
  const navigate = useNavigate()
  const novaAmostraCtx = useNovaAmostraModalOptional()
  const [menuCadastroAberto, setMenuCadastroAberto] = useState(false)
  const btnMenuCadastroRef = useRef(null)
  const popMenuCadastroRef = useRef(null)
  const [menuAbertoId, setMenuAbertoId] = useState(null)
  const [abertoTerreno, setAbertoTerreno] = useState(true)
  const [abertoPrecos, setAbertoPrecos] = useState(true)
  const [abertoServicos, setAbertoServicos] = useState(true)

  useEffect(() => {
    if (menuAbertoId == null) return
    function handleClickOutside(e) {
      const pop = document.getElementById(`menu-pop-${menuAbertoId}`)
      const btn = document.getElementById(`menu-btn-${menuAbertoId}`)
      if (pop?.contains(e.target) || btn?.contains(e.target)) return
      setMenuAbertoId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuAbertoId])

  useEffect(() => {
    if (!menuCadastroAberto) return
    function handleClickOutside(e) {
      if (
        btnMenuCadastroRef.current?.contains(e.target) ||
        popMenuCadastroRef.current?.contains(e.target)
      ) {
        return
      }
      setMenuCadastroAberto(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuCadastroAberto])

  return (
    <aside className="flex w-full max-w-full shrink-0 flex-col border-b border-slate-200 bg-white md:w-[300px] md:max-w-[300px] md:border-b-0 md:border-r md:border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-[#1e293b]">Mapa</h2>
        {somenteLeitura ? null : (
          <div className="relative shrink-0" ref={btnMenuCadastroRef}>
            <button
              type="button"
              onClick={() => setMenuCadastroAberto((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00B37E] text-xl font-light leading-none text-white shadow-sm transition-opacity hover:opacity-90"
              aria-expanded={menuCadastroAberto}
              aria-haspopup="menu"
              aria-label="Cadastros: empreendimento ou incluir amostra na proposta"
              title="Cadastrar"
            >
              +
            </button>
            {menuCadastroAberto ? (
              <div
                ref={popMenuCadastroRef}
                role="menu"
                className="absolute right-0 top-full z-30 mt-1 min-w-[13.5rem] rounded-lg border border-slate-200 bg-white py-1 text-left text-sm shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setMenuCadastroAberto(false)
                    navigate(empreendimento)
                  }}
                >
                  Cadastrar empreendimento
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setMenuCadastroAberto(false)
                    if (novaAmostraCtx) {
                      novaAmostraCtx.abrirNovaAmostra()
                    }
                  }}
                >
                  Incluir amostra
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-slate-100">
          <LinhaSecao
            titulo="Terreno"
            aberto={abertoTerreno}
            onAlternar={setAbertoTerreno}
            interruptor={
              <Interruptor
                checked={camadaTerreno}
                onChange={onCamadaTerreno}
                aria-label="Camada terreno"
              />
            }
          />
          {abertoTerreno ? (
            <p className="px-4 pb-3 text-xs text-slate-500">Exibe o imóvel sujeito no mapa.</p>
          ) : null}
        </div>

        <div className="border-b border-slate-100">
          <LinhaSecao
            titulo="Mapa de preços"
            aberto={abertoPrecos}
            onAlternar={setAbertoPrecos}
            interruptor={
              <Interruptor
                checked={camadaPrecos}
                onChange={onCamadaPrecos}
                aria-label="Mapa de preços"
              />
            }
          />
          {abertoPrecos && camadaPrecos ? (
            <div className="space-y-2 px-4 pb-3">
              <p className="text-[11px] leading-snug text-slate-500">
                {somenteLeitura
                  ? 'Amostras de mercado que compõem esta apresentação ao investidor.'
                  : 'Amostras de mercado que compõem a proposta ao investidor — inclua outras pelo + ou remova pelo menu (⋮).'}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Abaixo da média
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#eab308]" /> Próximo da média
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Acima da média
                </span>
              </div>
              <ul className="max-h-52 space-y-0.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 py-1">
                {amostras.map((a, idx) => {
                  const visivel = visivelPorId[a.id] !== false
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-white"
                    >
                      <button
                        type="button"
                        className="rounded p-1 hover:bg-slate-100"
                        aria-label={visivel ? 'Ocultar no mapa' : 'Mostrar no mapa'}
                        onClick={() => onToggleVisivelAmostra(a.id)}
                      >
                        <EyeIcon off={!visivel} />
                      </button>
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-700" title={a.nome}>
                        #{idx + 1} — {a.nome}
                      </span>
                      {somenteLeitura ? null : (
                        <div className="relative shrink-0">
                          <button
                            id={`menu-btn-${a.id}`}
                            type="button"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            aria-label="Menu da amostra"
                            aria-expanded={menuAbertoId === a.id}
                            onClick={() => setMenuAbertoId((id) => (id === a.id ? null : a.id))}
                          >
                            <DotsIcon />
                          </button>
                          {menuAbertoId === a.id ? (
                            <div
                              id={`menu-pop-${a.id}`}
                              className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 text-xs shadow-lg"
                            >
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                                onClick={() => setMenuAbertoId(null)}
                              >
                                Centralizar no mapa (em breve)
                              </button>
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-slate-400 cursor-not-allowed"
                                onClick={() => {
                                  setMenuAbertoId(null)
                                  alert('Funcionalidade de edição será implementada em breve')
                                }}
                              >
                                Editar amostra
                              </button>
                              {onRemoverAmostra ? (
                                <button
                                  type="button"
                                  className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setMenuAbertoId(null)
                                    if (
                                      window.confirm(
                                        'Remover esta amostra do portfólio da proposta? Não é possível desfazer.',
                                      )
                                    ) {
                                      onRemoverAmostra(a.id)
                                    }
                                  }}
                                >
                                  Remover da proposta
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-b border-slate-100">
          <LinhaSecao
            titulo="Mapa de serviços"
            aberto={abertoServicos}
            onAlternar={setAbertoServicos}
            interruptor={
              <Interruptor
                checked={camadaServicos}
                onChange={onCamadaServicos}
                aria-label="Mapa de serviços"
              />
            }
          />
          {abertoServicos ? (
            <p className="px-4 pb-3 text-xs text-slate-500">POIs próximos (OpenStreetMap).</p>
          ) : null}
        </div>

        <div className="px-3 py-2">
          <Toggle
            id="alcance-terrenos"
            label="Exibir alcance dos terrenos"
            description="Círculos de 500m e 1000m a partir do empreendimento; amostras aparecem numeradas como na lista (#1, #2…). Desligue para voltar ao mapa de preços por cores."
            checked={alcanceTerrenos}
            onChange={onAlcanceTerrenos}
          />
          <Toggle id="mostrar-nomes" label="Mostrar nomes" checked={mostrarNomes} onChange={onMostrarNomes} />
          <Toggle
            id="mostrar-nomes-completos"
            label="Mostrar nomes completos"
            checked={mostrarNomesCompletos}
            onChange={onMostrarNomesCompletos}
          />
        </div>
      </div>
    </aside>
  )
}
