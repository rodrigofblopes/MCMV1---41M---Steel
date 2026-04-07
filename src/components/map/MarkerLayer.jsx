import { Fragment, useMemo } from 'react'
import L from 'leaflet'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { faixaPrecoRelativaMedia } from '../../utils/calculos.js'
import AmostraMapPopup from './AmostraMapPopup.jsx'

const COR_PRECO = { baixo: '#22c55e', medio: '#eab308', alto: '#ef4444' }

function criarIconePreco(cor) {
  return L.divIcon({
    className: 'avalia-marcador-preco',
    html: `<div style="background:${cor};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

const iconeServicoMapa = L.divIcon({
  className: 'avalia-marcador-servico-amostra',
  html: `<div style="background:#64748b;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function criarIconeAmostraNumerada(num) {
  const n = String(num)
  const px = n.length > 1 ? 30 : 28
  const ax = Math.round(px / 2)
  return L.divIcon({
    className: 'avalia-marcador-amostra-num',
    html: `<div style="width:${px}px;height:${px}px;background:#facc15;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#713f12;line-height:1">${n}</div>`,
    iconSize: [px, px],
    iconAnchor: [ax, ax],
  })
}

export default function MarkerLayer({
  amostras,
  precoMedio,
  camadaPrecos,
  visivelPorId,
  mostrarNomes,
  /** Com raios 500/1000m ativos: marcadores amarelos numerados (#1, #2…) para cruzar com a lista. */
  modoAnaliseDistancia = false,
}) {
  const iconesPreco = useMemo(
    () => ({
      baixo: criarIconePreco(COR_PRECO.baixo),
      medio: criarIconePreco(COR_PRECO.medio),
      alto: criarIconePreco(COR_PRECO.alto),
    }),
    [],
  )

  return (
    <>
      {camadaPrecos
        ? amostras
            .filter(
              (a) =>
                Number.isFinite(Number(a.lat)) &&
                Number.isFinite(Number(a.lng)) &&
                a.tipo !== 'terreno',
            )
            .map((a) => {
              if (visivelPorId[a.id] === false) return null
              const ordemLista = amostras.findIndex((x) => x.id === a.id) + 1
              const faixa = faixaPrecoRelativaMedia(a.preco, precoMedio)
              let icone
              if (modoAnaliseDistancia) {
                icone = criarIconeAmostraNumerada(ordemLista)
              } else if (a.tipo === 'servico') {
                icone = iconeServicoMapa
              } else {
                icone = iconesPreco[faixa]
              }
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
            })
        : null}
    </>
  )
}
