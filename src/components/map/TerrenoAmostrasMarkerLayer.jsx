import { Fragment, useMemo } from 'react'
import L from 'leaflet'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { filtrarAmostrasTerrenoParaPainel } from '../../constants/amostrasTerrenoMercado.js'
import { faixaPrecoRelativaMedia, precoMedioTotalTerrenoMercado } from '../../utils/calculos.js'
import AmostraMapPopup from './AmostraMapPopup.jsx'

/** Losangos no mapa: azul claro / violeta claro / violeta escuro vs. média das amostras 14–17. */
const COR_LOTE_FAIXA = {
  baixo: '#38bdf8',
  medio: '#a78bfa',
  alto: '#5b21b6',
}

const iconesLosangoCache = new Map()

function iconeLosangoParaFaixa(faixa) {
  const cor = COR_LOTE_FAIXA[faixa] ?? COR_LOTE_FAIXA.medio
  let icone = iconesLosangoCache.get(cor)
  if (!icone) {
    icone = L.divIcon({
      className: 'avalia-marcador-lote-losango',
      html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
        <div style="width:12px;height:12px;background:${cor};transform:rotate(45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
      </div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
    iconesLosangoCache.set(cor, icone)
  }
  return icone
}

function criarIconeLosangoNumerado(num, faixa) {
  const cor = COR_LOTE_FAIXA[faixa] ?? COR_LOTE_FAIXA.medio
  const n = String(num)
  const px = n.length > 1 ? 32 : 28
  const ax = Math.round(px / 2)
  return L.divIcon({
    className: 'avalia-marcador-lote-losango-num',
    html: `<div style="position:relative;width:${px}px;height:${px}px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:14px;height:14px;background:${cor};transform:rotate(45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
      <span style="position:relative;z-index:1;font-size:10px;font-weight:800;color:#fff;text-shadow:0 0 3px #1e293b,0 0 2px #1e293b">${n}</span>
    </div>`,
    iconSize: [px, px],
    iconAnchor: [ax, ax],
  })
}

/** Amostras 14–17: losangos coloridos pela média de preço total do grupo; camada Terreno. */
export default function TerrenoAmostrasMarkerLayer({
  amostras,
  ativo,
  visivelPorId,
  mostrarNomes,
  modoAnaliseDistancia = false,
}) {
  const pontos = useMemo(
    () =>
      filtrarAmostrasTerrenoParaPainel(amostras).filter(
        (a) => Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng)),
      ),
    [amostras],
  )

  const precoMedioGrupo = useMemo(() => precoMedioTotalTerrenoMercado(amostras), [amostras])

  if (!ativo) return null

  return (
    <>
      {pontos.map((a) => {
        if (visivelPorId[a.id] === false) return null
        const ordemLista = amostras.findIndex((x) => x.id === a.id) + 1
        const faixa = faixaPrecoRelativaMedia(Number(a.preco), precoMedioGrupo)
        const icone = modoAnaliseDistancia
          ? criarIconeLosangoNumerado(ordemLista, faixa)
          : iconeLosangoParaFaixa(faixa)
        return (
          <Fragment key={a.id}>
            <Marker position={[a.lat, a.lng]} icon={icone}>
              <Popup className="avalia-popup-amostra" minWidth={300} maxWidth={340}>
                <AmostraMapPopup amostra={a} />
              </Popup>
              {mostrarNomes && !modoAnaliseDistancia ? (
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent>
                  #{ordemLista}
                </Tooltip>
              ) : null}
            </Marker>
          </Fragment>
        )
      })}
    </>
  )
}
