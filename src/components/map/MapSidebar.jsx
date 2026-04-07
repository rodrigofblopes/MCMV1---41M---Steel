import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { filtrarAmostrasTerrenoParaPainel } from '../../constants/amostrasTerrenoMercado.js'
import { useNovaAmostraModalOptional } from '../../contexts/NovaAmostraModalContext.jsx'
import { empreendimento } from '../../routes/paths.js'
import { formatarArea } from '../../utils/formatadores.js'
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

function ordemGlobalNaLista(amostras, id) {
  const i = amostras.findIndex((x) => x.id === id)
  return i >= 0 ? i + 1 : 0
}

/** Uma linha da lista de amostras (olho + #n + menu). */
function ItemAmostraMapa({
  a,
  ordemGlobal,
  visivelPorId,
  onToggleVisivelAmostra,
  menuAbertoId,
  setMenuAbertoId,
  somenteLeitura,
  onRemoverAmostra,
  /** Lista da aba Terreno: nome, área e id da amostra (14–17). */
  resumoTerreno = false,
  /** Lista estilo apresentação: olho + # + nome completo (Viva Real etc.). */
  linhaComNomeCompleto = false,
}) {
  const visivel = visivelPorId[a.id] !== false
  const ar = Number(a.area)
  const areaFmt = Number.isFinite(ar) ? formatarArea(ar) : '—'
  return (
    <li className="flex items-center gap-2 px-2 py-1.5 hover:bg-white">
      <button
        type="button"
        className="shrink-0 rounded p-1 hover:bg-slate-100"
        aria-label={visivel ? 'Ocultar no mapa' : 'Mostrar no mapa'}
        onClick={() => onToggleVisivelAmostra(a.id)}
      >
        <EyeIcon off={!visivel} />
      </button>
      {resumoTerreno ? (
        <p
          className="min-w-0 flex-1 truncate text-xs text-slate-800"
          title={`${a.nome || ''} · id ${a.id}`}
        >
          <span className="font-semibold tabular-nums text-slate-900">#{ordemGlobal}</span>
          <span className="font-normal text-slate-400"> — </span>
          <span className="font-medium text-slate-700">{a.nome || '—'}</span>
          <span className="font-normal text-slate-500"> ({areaFmt})</span>
          <span className="font-normal text-slate-400"> · id {a.id}</span>
        </p>
      ) : linhaComNomeCompleto ? (
        <p
          className="min-w-0 flex-1 text-xs leading-snug text-slate-800"
          title={a.nome ? `${a.nome} (#${ordemGlobal})` : `#${ordemGlobal}`}
        >
          <span className="font-semibold tabular-nums text-slate-900">#{ordemGlobal}</span>
          <span className="text-slate-400"> · </span>
          <span className="font-medium text-slate-700">{a.nome || '—'}</span>
        </p>
      ) : (
        <span
          className="min-w-0 flex-1 tabular-nums text-xs font-semibold text-slate-800"
          title={a.nome ? `${a.nome} (#${ordemGlobal})` : `#${ordemGlobal}`}
        >
          #{ordemGlobal}
        </span>
      )}
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
}

function LinhaSecao({ titulo, descricao, aberto, onAlternar, interruptor }) {
  return (
    <div className="flex items-start gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0">
      <button
        type="button"
        onClick={() => onAlternar(!aberto)}
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
        aria-expanded={aberto}
      >
        <span className="flex items-center gap-2">
          <Chevron aberto={aberto} />
          <span className="text-sm font-medium text-[#1e293b]">{titulo}</span>
        </span>
        {descricao ? (
          <span className="pl-7 text-[10px] leading-snug text-slate-500">{descricao}</span>
        ) : null}
      </button>
      <div className="shrink-0 pt-0.5">{interruptor}</div>
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
  const [abertoServicos, setAbertoServicos] = useState(false)

  const listaUnidades = useMemo(() => amostras.filter((a) => a.tipo === 'unidade'), [amostras])
  const listaTerrenosMercado = useMemo(() => filtrarAmostrasTerrenoParaPainel(amostras), [amostras])
  const listaServicos = useMemo(() => amostras.filter((a) => a.tipo === 'servico'), [amostras])
  const listaOutras = useMemo(
    () => amostras.filter((a) => !['unidade', 'terreno', 'servico'].includes(a.tipo)),
    [amostras],
  )

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
            descricao="Exibe o imóvel sujeito no mapa."
            aberto={abertoTerreno}
            onAlternar={setAbertoTerreno}
            interruptor={
              <Interruptor checked={camadaTerreno} onChange={onCamadaTerreno} aria-label="Camada terreno" />
            }
          />
          {abertoTerreno ? (
            <div className="space-y-2 px-4 pb-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                Lotes comparáveis (mercado)
              </p>
              <p className="px-1 text-[10px] leading-relaxed text-slate-600">
                Prioridade ids <span className="font-semibold text-slate-800">14 a 17</span>; losangos no mapa conforme
                faixa de preço.
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px] font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rotate-45 border border-white bg-[#38bdf8] shadow-sm"
                    aria-hidden
                  />
                  Abaixo da média
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rotate-45 border border-white bg-[#a78bfa] shadow-sm"
                    aria-hidden
                  />
                  Próximo da média
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rotate-45 border border-white bg-[#5b21b6] shadow-sm"
                    aria-hidden
                  />
                  Acima da média
                </span>
              </div>
              {listaTerrenosMercado.length > 0 ? (
                <ul className="max-h-40 space-y-0.5 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-sm">
                  {listaTerrenosMercado.map((a) => (
                    <ItemAmostraMapa
                      key={a.id}
                      a={a}
                      ordemGlobal={ordemGlobalNaLista(amostras, a.id)}
                      visivelPorId={visivelPorId}
                      onToggleVisivelAmostra={onToggleVisivelAmostra}
                      menuAbertoId={menuAbertoId}
                      setMenuAbertoId={setMenuAbertoId}
                      somenteLeitura={somenteLeitura}
                      onRemoverAmostra={onRemoverAmostra}
                      resumoTerreno
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-1 py-2 text-xs text-slate-500">
                  Sem amostras tipo terreno. Cadastre lotes ou restaure o exemplo.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="border-b border-slate-100">
          <LinhaSecao
            titulo="Mapa de preços"
            descricao="Amostras de mercado que compõem esta apresentação ao investidor."
            aberto={abertoPrecos}
            onAlternar={setAbertoPrecos}
            interruptor={
              <Interruptor checked={camadaPrecos} onChange={onCamadaPrecos} aria-label="Mapa de preços" />
            }
          />
          {abertoPrecos && camadaPrecos ? (
            <div className="space-y-3 px-4 pb-3">
              {listaUnidades.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-2 px-1 text-[10px] font-medium text-slate-600">
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
                    {listaUnidades.map((a) => (
                      <ItemAmostraMapa
                        key={a.id}
                        a={a}
                        ordemGlobal={ordemGlobalNaLista(amostras, a.id)}
                        visivelPorId={visivelPorId}
                        onToggleVisivelAmostra={onToggleVisivelAmostra}
                        menuAbertoId={menuAbertoId}
                        setMenuAbertoId={setMenuAbertoId}
                        somenteLeitura={somenteLeitura}
                        onRemoverAmostra={onRemoverAmostra}
                        linhaComNomeCompleto
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="px-1 text-xs text-slate-500">Nenhuma unidade no portfólio.</p>
              )}

              {listaServicos.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Serviços</p>
                  <ul className="max-h-28 space-y-0.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 py-1">
                    {listaServicos.map((a) => (
                      <ItemAmostraMapa
                        key={a.id}
                        a={a}
                        ordemGlobal={ordemGlobalNaLista(amostras, a.id)}
                        visivelPorId={visivelPorId}
                        onToggleVisivelAmostra={onToggleVisivelAmostra}
                        menuAbertoId={menuAbertoId}
                        setMenuAbertoId={setMenuAbertoId}
                        somenteLeitura={somenteLeitura}
                        onRemoverAmostra={onRemoverAmostra}
                        linhaComNomeCompleto
                      />
                    ))}
                  </ul>
                </div>
              ) : null}

              {listaOutras.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Outras amostras
                  </p>
                  <ul className="max-h-28 space-y-0.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 py-1">
                    {listaOutras.map((a) => (
                      <ItemAmostraMapa
                        key={a.id}
                        a={a}
                        ordemGlobal={ordemGlobalNaLista(amostras, a.id)}
                        visivelPorId={visivelPorId}
                        onToggleVisivelAmostra={onToggleVisivelAmostra}
                        menuAbertoId={menuAbertoId}
                        setMenuAbertoId={setMenuAbertoId}
                        somenteLeitura={somenteLeitura}
                        onRemoverAmostra={onRemoverAmostra}
                        linhaComNomeCompleto
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-b border-slate-100">
          <LinhaSecao
            titulo="Mapa de serviços"
            descricao="POIs próximos (OpenStreetMap)."
            aberto={abertoServicos}
            onAlternar={setAbertoServicos}
            interruptor={
              <Interruptor checked={camadaServicos} onChange={onCamadaServicos} aria-label="Mapa de serviços" />
            }
          />
        </div>

        <div className="border-t border-slate-100 px-3 py-2">
          <Toggle
            id="alcance-terrenos"
            label="Exibir alcance dos terrenos"
            description="Círculos de 500m e 1000m a partir do empreendimento; amostras numeradas como na lista do portfólio."
            checked={alcanceTerrenos}
            onChange={onAlcanceTerrenos}
          />
          <Toggle
            id="mostrar-nomes"
            label="Mostrar nomes"
            description="Numeração (#1, #2…) nos marcadores, alinhada à lista do portfólio."
            checked={mostrarNomes}
            onChange={onMostrarNomes}
          />
        </div>
      </div>
    </aside>
  )
}
