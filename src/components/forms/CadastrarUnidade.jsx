import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CoordenadaInput from './CoordenadaInput.jsx'

function parsePrecoBR(valor) {
  if (valor == null || String(valor).trim() === '') return NaN
  const s = String(valor).trim().replace(/\s/g, '')
  const normalizado = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, '')
  return Number(normalizado)
}

function estadoVazioFormulario() {
  return {
    nome: '',
    preco: '',
    area: '',
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    urlAnuncio: '',
    mapsLink: '',
    lat: '',
    lng: '',
  }
}

export default function CadastrarUnidade({
  voltarPara = "/apresentacao-investidor",
  titulo = 'Cadastrar unidade',
  subtitulo,
  onSalvar,
  /** Quando definido (edição), preenche os campos uma vez por referência estável. */
  valoresIniciais = null,
  textoBotaoSalvar = 'Salvar',
  /** unidade | terreno | servico — define campos e validação. */
  variant = 'unidade',
  /** page = tela cheia; embed = dentro do modal Nova amostra. */
  layout = 'page',
  /** No embed: título da faixa "Cadastrar Terreno" etc. */
  tituloSecao,
  /** No embed: botão Voltar ao passo 1. */
  onVoltar,
  /** Placeholder do campo Nome (ex.: Terreno #3). */
  nomePlaceholder,
}) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [area, setArea] = useState('')
  const [quartos, setQuartos] = useState(0)
  const [banheiros, setBanheiros] = useState(0)
  const [vagas, setVagas] = useState(0)
  const [urlAnuncio, setUrlAnuncio] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (valoresIniciais) {
      setNome(valoresIniciais.nome ?? '')
      setPreco(valoresIniciais.preco ?? '')
      setArea(valoresIniciais.area ?? '')
      setQuartos(valoresIniciais.quartos ?? 0)
      setBanheiros(valoresIniciais.banheiros ?? 0)
      setVagas(valoresIniciais.vagas ?? 0)
      setUrlAnuncio(valoresIniciais.urlAnuncio ?? '')
      setMapsLink(valoresIniciais.mapsLink ?? '')
      setLat(valoresIniciais.lat ?? '')
      setLng(valoresIniciais.lng ?? '')
    } else {
      const z = estadoVazioFormulario()
      setNome(z.nome)
      setPreco(z.preco)
      setArea(z.area)
      setQuartos(z.quartos)
      setBanheiros(z.banheiros)
      setVagas(z.vagas)
      setUrlAnuncio(z.urlAnuncio)
      setMapsLink(z.mapsLink)
      setLat(z.lat)
      setLng(z.lng)
    }
    setErros({})
  }, [valoresIniciais])

  function validar() {
    const next = {}
    const precoNum = parsePrecoBR(preco)
    const areaNum = Number(String(area).replace(',', '.'))

    if (variant !== 'servico') {
      if (!preco || Number.isNaN(precoNum) || precoNum < 0) {
        next.preco = 'Informe um preço válido.'
      }
      if (!area || Number.isNaN(areaNum) || areaNum <= 0) {
        next.area = 'Informe uma área válida (m²).'
      }
    }
    if (lat === '' || lng === '') {
      next.coords = 'Informe latitude e longitude (cole o link do Google Maps ou preencha manualmente).'
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

    const precoNum = parsePrecoBR(preco)
    const areaNum = Number(String(area).replace(',', '.'))
    const payload = {
      nome: nome.trim() || undefined,
      preco: variant === 'servico' ? 0 : precoNum,
      area: variant === 'servico' ? 0 : areaNum,
      quartos: variant === 'servico' || variant === 'terreno' ? 0 : Number(quartos) || 0,
      banheiros: variant === 'servico' || variant === 'terreno' ? 0 : Number(banheiros) || 0,
      vagas: variant === 'servico' || variant === 'terreno' ? 0 : Number(vagas) || 0,
      urlAnuncio:
        variant === 'servico' ? undefined : urlAnuncio.trim() || undefined,
      mapsLink: mapsLink.trim() || undefined,
      lat: lat === '' ? undefined : Number(lat),
      lng: lng === '' ? undefined : Number(lng),
    }

    onSalvar?.({ ...payload, tipo: variant })
  }

  const mostrarPrecoArea = variant !== 'servico'
  const mostrarComodos = variant === 'unidade'
  const mostrarUrlAnuncio = variant !== 'servico'

  const formClass =
    layout === 'embed'
      ? 'space-y-5'
      : 'space-y-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6'

  const inner = (
    <>
      {layout === 'embed' && tituloSecao ? (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className="text-sm font-semibold text-[#1e293b]">{tituloSecao}</span>
          {onVoltar ? (
            <button
              type="button"
              onClick={onVoltar}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#1e293b]"
            >
              <span aria-hidden>‹</span> Voltar
            </button>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className={formClass}>
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              placeholder={nomePlaceholder || 'Amostra 12 - Residencial Cujubim'}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            <p className="mt-1 text-xs text-slate-500">
              Dê um nome descritivo para o imóvel, terreno ou ponto de interesse.
            </p>
          </div>

          {mostrarPrecoArea ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="preco" className="mb-1.5 block text-sm font-medium text-slate-700">
                Preço <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm outline-none transition-[border-color,box-shadow] focus-within:border-[#00B37E] focus-within:ring-2 focus-within:ring-[#00B37E]/25">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                  R$
                </span>
                <input
                  id="preco"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0,00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Insira o preço do imóvel ou terreno.</p>
              {erros.preco ? <p className="mt-1 text-xs text-red-600">{erros.preco}</p> : null}
            </div>

            <div>
              <label htmlFor="area" className="mb-1.5 block text-sm font-medium text-slate-700">
                Área <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm outline-none transition-[border-color,box-shadow] focus-within:border-[#00B37E] focus-within:ring-2 focus-within:ring-[#00B37E]/25">
                <input
                  id="area"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="min-w-0 flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                  m²
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Informe a área total em m².</p>
              {erros.area ? <p className="mt-1 text-xs text-red-600">{erros.area}</p> : null}
            </div>
          </div>
          ) : null}

          {mostrarComodos ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="quartos" className="mb-1.5 block text-sm font-medium text-slate-700">
                Quartos
              </label>
              <input
                id="quartos"
                type="number"
                min={0}
                step={1}
                value={quartos}
                onChange={(e) => {
                  const v = e.target.value
                  setQuartos(v === '' ? 0 : parseInt(v, 10) || 0)
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
              />
              <p className="mt-1 text-xs text-slate-500">Número de quartos.</p>
            </div>
            <div>
              <label htmlFor="banheiros" className="mb-1.5 block text-sm font-medium text-slate-700">
                Banheiros
              </label>
              <input
                id="banheiros"
                type="number"
                min={0}
                step={1}
                value={banheiros}
                onChange={(e) => {
                  const v = e.target.value
                  setBanheiros(v === '' ? 0 : parseInt(v, 10) || 0)
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
              />
              <p className="mt-1 text-xs text-slate-500">Número de banheiros.</p>
            </div>
            <div>
              <label htmlFor="vagas" className="mb-1.5 block text-sm font-medium text-slate-700">
                Vagas
              </label>
              <input
                id="vagas"
                type="number"
                min={0}
                step={1}
                value={vagas}
                onChange={(e) => {
                  const v = e.target.value
                  setVagas(v === '' ? 0 : parseInt(v, 10) || 0)
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
              />
              <p className="mt-1 text-xs text-slate-500">Vagas de estacionamento.</p>
            </div>
          </div>
          ) : null}

          {mostrarUrlAnuncio ? (
          <div>
            <label htmlFor="url-anuncio" className="mb-1.5 block text-sm font-medium text-slate-700">
              URL do anúncio <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <input
              id="url-anuncio"
              type="text"
              inputMode="url"
              placeholder="https://"
              value={urlAnuncio}
              onChange={(e) => setUrlAnuncio(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-[#00B37E] focus:ring-2 focus:ring-[#00B37E]/25"
            />
            <p className="mt-1 text-xs text-slate-500">Link para o anúncio online do imóvel ou terreno.</p>
          </div>
          ) : null}

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

          <button
            type="submit"
            className={[
              'mt-2 font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              layout === 'embed'
                ? 'w-auto rounded-full bg-[#0f172a] px-8 py-2.5 text-sm hover:bg-neutral-800 focus-visible:outline-[#0f172a]'
                : 'w-full rounded-lg bg-black py-3 text-sm hover:bg-neutral-800 focus-visible:outline-black',
            ].join(' ')}
          >
            {textoBotaoSalvar}
          </button>
        </form>
    </>
  )

  if (layout === 'embed') {
    return <div className="w-full text-[#1e293b]">{inner}</div>
  }

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-4 py-6 text-[#1e293b] sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{titulo}</h1>
            {subtitulo ? <p className="mt-1 text-sm text-slate-600">{subtitulo}</p> : null}
          </div>
          <Link
            to={voltarPara}
            className="shrink-0 text-sm font-medium text-slate-600 underline-offset-4 hover:text-[#1e293b] hover:underline"
          >
            Voltar
          </Link>
        </div>
        {inner}
      </div>
    </div>
  )
}
