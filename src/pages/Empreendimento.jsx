import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CoordenadaInput from '../components/forms/CoordenadaInput.jsx'
import { useEmpreendimento } from '../contexts/EmpreendimentoContext.jsx'
import { ROTULO_PROJETO_COM_AREA } from '../constants/areaProjeto.js'
import { patchViabilidadeProjeto } from '../hooks/useViabilidadeCalcStorage.js'

export default function Empreendimento() {
  const { dados, salvarEmpreendimento } = useEmpreendimento()
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [nome, setNome] = useState('')
  const [areaTerreno, setAreaTerreno] = useState('')
  const [endereco, setEndereco] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [unidades, setUnidades] = useState('')
  const [erros, setErros] = useState({})
  const [salvoMsg, setSalvoMsg] = useState(false)

  useEffect(() => {
    setNomeProjeto(dados.nomeProjeto ?? '')
    setNome(dados.nome ?? '')
    setAreaTerreno(
      dados.areaTerreno != null && Number.isFinite(Number(dados.areaTerreno))
        ? String(dados.areaTerreno).replace('.', ',')
        : '',
    )
    setEndereco(dados.endereco ?? '')
    setMapsLink(dados.mapsLink ?? '')
    setLat(dados.lat != null ? String(dados.lat) : '')
    setLng(dados.lng != null ? String(dados.lng) : '')
    setUnidades(dados.unidades != null ? String(dados.unidades) : '')
    setErros({})
  }, [dados])

  function validar() {
    const next = {}
    const areaNum = Number(String(areaTerreno).replace(',', '.'))
    if (!nomeProjeto.trim()) {
      next.nomeProjeto = 'Informe o nome do empreendimento.'
    }
    if (!areaTerreno.trim() || Number.isNaN(areaNum) || areaNum <= 0) {
      next.areaTerreno = 'Informe a área do terreno em m².'
    }
    if (!endereco.trim()) {
      next.endereco = 'Informe o endereço do empreendimento.'
    }
    if (lat === '' || lng === '') {
      next.coords = 'Informe latitude e longitude (link do Google Maps ou manual).'
    }
    const latNum = lat === '' ? NaN : Number(lat)
    const lngNum = lng === '' ? NaN : Number(lng)
    if (lat !== '' && (Number.isNaN(latNum) || latNum < -90 || latNum > 90)) {
      next.lat = 'Latitude inválida.'
    }
    if (lng !== '' && (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180)) {
      next.lng = 'Longitude inválida.'
    }
    setErros(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    const areaNum = Number(String(areaTerreno).replace(',', '.'))
    salvarEmpreendimento({
      nomeProjeto: nomeProjeto.trim(),
      nome: nome.trim() || nomeProjeto.trim(),
      areaTerreno: areaNum,
      endereco: endereco.trim(),
      mapsLink: mapsLink.trim(),
      lat: Number(lat),
      lng: Number(lng),
      unidades: unidades.trim(),
    })
    if (unidades.trim()) {
      patchViabilidadeProjeto({ unidades: unidades.trim() })
    }
    setSalvoMsg(true)
    window.setTimeout(() => setSalvoMsg(false), 3500)
  }

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-4 py-6 text-[#1e293b] sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Empreendimento</h1>
            <p className="mt-1 text-sm text-slate-600">
              Registre o terreno sujeito à avaliação (projeto de incorporação). Os raios de influência no mapa usam
              esta localização.
            </p>
          </div>
          <Link
            to="/apresentacao-investidor"
            className="shrink-0 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[#1e293b] hover:underline"
          >
            Voltar
          </Link>
        </div>

        {salvoMsg ? (
          <div
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            Dados do empreendimento salvos. O mapa e a tabela de distâncias foram atualizados.
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <label htmlFor="nomeProjeto" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome do empreendimento <span className="text-red-500">*</span>
            </label>
            <input
              id="nomeProjeto"
              type="text"
              value={nomeProjeto}
              onChange={(e) => setNomeProjeto(e.target.value)}
              placeholder={ROTULO_PROJETO_COM_AREA}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            <p className="mt-1 text-xs text-slate-500">Nome oficial ou comercial do empreendimento.</p>
            {erros.nomeProjeto ? <p className="mt-1 text-xs text-red-600">{erros.nomeProjeto}</p> : null}
          </div>

          <div>
            <label htmlFor="nome-mapa" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome no mapa (opcional)
            </label>
            <input
              id="nome-mapa"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={`${ROTULO_PROJETO_COM_AREA} — Loteamento Sevilha (terreno sujeito)`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            <p className="mt-1 text-xs text-slate-500">
              Texto curto no marcador e tooltips; se vazio, usamos o nome do empreendimento.
            </p>
          </div>

          <div>
            <label htmlFor="area-terreno" className="mb-1.5 block text-sm font-medium text-slate-700">
              Área do terreno <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm outline-none transition-[border-color,box-shadow] focus-within:border-[#00B37E] focus-within:ring-2 focus-within:ring-[#00B37E]/25">
              <input
                id="area-terreno"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={areaTerreno}
                onChange={(e) => setAreaTerreno(e.target.value)}
                className="min-w-0 flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
              />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                m²
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Área total do lote ou terreno da incorporação.</p>
            {erros.areaTerreno ? <p className="mt-1 text-xs text-red-600">{erros.areaTerreno}</p> : null}
          </div>

          <div>
            <label htmlFor="empreendimento-unidades" className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantidade de unidades (opcional)
            </label>
            <input
              id="empreendimento-unidades"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={unidades}
              onChange={(e) => setUnidades(e.target.value)}
              placeholder="Ex.: 8"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            <p className="mt-1 text-xs text-slate-500">
              Ao salvar, o mesmo valor é enviado para a aba Projeto da Calculadora de Viabilidade (se preenchido).
            </p>
          </div>

          <div>
            <label htmlFor="endereco" className="mb-1.5 block text-sm font-medium text-slate-700">
              Endereço <span className="text-red-500">*</span>
            </label>
            <textarea
              id="endereco"
              rows={3}
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Logradouro, bairro, cidade — UF"
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            {erros.endereco ? <p className="mt-1 text-xs text-red-600">{erros.endereco}</p> : null}
          </div>

          <CoordenadaInput
            mapsLink={mapsLink}
            onMapsLinkChange={setMapsLink}
            lat={lat}
            lng={lng}
            onLatChange={setLat}
            onLngChange={setLng}
          />
          {erros.coords ? <p className="text-xs text-red-600">{erros.coords}</p> : null}
          {erros.lat ? <p className="text-xs text-red-600">{erros.lat}</p> : null}
          {erros.lng ? <p className="text-xs text-red-600">{erros.lng}</p> : null}

          <div className="pt-1">
            <button
              type="submit"
              className="rounded-full bg-[#0f172a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
            >
              Salvar empreendimento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
