import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, OrbitControls, useBounds, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { Box3, Vector3 } from 'three'

/** Maior dimensão do conjunto após normalização (espaço da cena). */
const ALVO_MAX_DIM = 7.5

const VIZ_LAYER = '__vizLayer'
/** Nós de vista/câmera (IFC/Revit); fora da lista de camadas e sempre ocultos. */
const VIZ_SKIP_LAYER = '__vizSkipLayer'

function isIgnoredLayerRootName(name) {
  const n = (name || '').trim()
  return /^active_view/i.test(n)
}

/**
 * Várias raízes com o mesmo prefixo (etapas exportadas como Wall1, Wall2…) → camada “Paredes em Steel Frame”.
 * TR, CARTOLA (com ou sem LSF) e Laje_Técnica partilham um grupo (rótulo na UI: Cobertura).
 */
function mergeGroupKey(name) {
  const n = (name || '').trim()
  if (!n) return null
  if (/^wall([\s_#]|$|\d)/i.test(n)) return 'wall'
  if (/^tr([\s_#]|$|\d)/i.test(n)) return 'tr-lsf-laje'
  if (/^cartola($|[\-_\s#]|\d)/i.test(n)) return 'tr-lsf-laje'
  if (/^laje[_\s-]*técnica/i.test(n) || /^laje[_\s-]*tecnica/i.test(n)) return 'tr-lsf-laje'
  return null
}

/** Títulos longos de IFC (ex.: …Elétricoifc, …Hidrosanitárioifc#1) → rótulo na UI. */
function prettyLayerRootLabel(rawName, index) {
  const n = (rawName || '').trim()
  if (/^MCMV/i.test(n) && /el[ée]trico/i.test(n)) return 'Elétrico'
  if (/^MCMV/i.test(n) && /hidrosanit[áa]rio/i.test(n)) return 'Hidrosanitário'
  if (/^MCMVFX1.*steel.*ifc#1/i.test(n)) return 'Placas'
  if (/^MCMV/i.test(n) && /radier/i.test(n)) return 'Radier'
  if (/^radier($|[\s_#]|\d)/i.test(n)) return 'Radier'
  if (/^grupo\s*2[23]($|[\s_#]|\d)/i.test(n)) return 'Radier'
  if (!n) {
    /* Raízes sem nome no GLB atual → Radier (ex.: "Grupo 22" / "Grupo 23"). */
    if (index === 21 || index === 22) return 'Radier'
    return `Grupo ${index + 1}`
  }
  return n
}

function medirMaxDim(obj) {
  obj.updateMatrixWorld(true)
  const box = new Box3().setFromObject(obj)
  if (box.isEmpty()) return 0
  const s = box.getSize(new Vector3())
  return Math.max(s.x, s.y, s.z)
}

/**
 * Desce wrappers com um único filho sem nome útil (export SketchUp/Rhino/Blender).
 */
function unwrapAnonymousChain(root) {
  let node = root
  for (let depth = 0; depth < 10; depth++) {
    const kids = node.children
    if (kids.length !== 1) break
    const only = kids[0]
    const name = only.name?.trim() ?? ''
    const generic = !name || /^group#?\d*$/i.test(name) || /^object#?\d*$/i.test(name) || name === 'Scene'
    if (!generic) break
    node = only
  }
  return node
}

/**
 * Filhos que funcionam como “camadas” (arquitetura, instalações, etc.).
 */
function discoverLayerRoots(raiz) {
  const node = unwrapAnonymousChain(raiz)
  let kids = [...node.children].filter(Boolean)

  if (kids.length === 1 && kids[0].children.length > 1) {
    const inner = kids[0]
    const innerKids = [...inner.children]
    const comNome = innerKids.filter((c) => c.name?.trim())
    if (comNome.length >= 2) {
      kids = innerKids
    }
  }

  if (kids.length >= 2) {
    return kids
  }
  if (kids.length === 1) {
    return kids
  }
  return [node]
}

/** Inspeciona subgrupos sob a raiz da etapa Placas (MCMVFX1…Steelifc#1). Só console (dev). */
function logSubgruposEtapaPlacas(raiz) {
  const rx = /mcmvfx1.*steel.*ifc#1/i
  const roots = discoverLayerRoots(raiz)
  const alvo = roots.find((r) => rx.test(String(r?.name || '').trim()))
  if (!alvo) {
    // eslint-disable-next-line no-console
    console.info(
      '[3D] Placas (MCMVFX1…Steelifc#1) não encontrada nas raízes:',
      roots.map((r) => r?.name || '(sem nome)'),
    )
    return
  }

  let meshCount = 0
  alvo.traverse((o) => {
    if (o.isMesh) meshCount += 1
  })

  let maxDepth = 0
  const medirProf = (o, d) => {
    maxDepth = Math.max(maxDepth, d)
    for (const c of o.children || []) medirProf(c, d + 1)
  }
  medirProf(alvo, 0)

  const diretos = [...(alvo.children || [])]
  // eslint-disable-next-line no-console
  console.info('[3D] Placas — nó raiz:', alvo.name || '(sem nome)')
  // eslint-disable-next-line no-console
  console.info(
    '[3D] Placas — filhos diretos:',
    diretos.length,
    diretos.map((k) => `${k.type || '?'} "${k.name || '(sem nome)'}"`),
  )
  // eslint-disable-next-line no-console
  console.info('[3D] Placas — total de meshes nesta etapa:', meshCount)
  // eslint-disable-next-line no-console
  console.info('[3D] Placas — profundidade máx. na subárvore:', maxDepth)

  const lines = []
  const maxLinhas = 80
  const maxNivel = 5
  const walk = (o, nivel, prefix) => {
    if (lines.length >= maxLinhas) return
    const nome = o.name?.trim() || '(sem nome)'
    const tipo = o.isMesh ? 'Mesh' : o.type || 'Object3D'
    if (nivel > 0) {
      lines.push(`${prefix}${tipo} ${nome}`)
    }
    if (nivel >= maxNivel) return
    for (const c of o.children || []) {
      walk(c, nivel + 1, `${prefix}  `)
      if (lines.length >= maxLinhas) return
    }
  }
  walk(alvo, 0, '')
  if (lines.length >= maxLinhas) lines.push('… (truncado)')
  // eslint-disable-next-line no-console
  console.info(`[3D] Placas — árvore (até ${maxNivel} níveis, máx. ${maxLinhas} linhas):\n${lines.join('\n')}`)
}

function aplicarSombras(raiz) {
  raiz.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })
}

function marcarCamadas(raiz, onLayersReady) {
  const allRoots = discoverLayerRoots(raiz)
  const roots = allRoots.filter((r) => !isIgnoredLayerRootName(r.name))

  const groups = new Map()
  roots.forEach((root, i) => {
    const rawName = root.name?.trim() ?? ''
    const mg = mergeGroupKey(rawName)
    const key = mg ?? `__one:${i}`
    if (!groups.has(key)) {
      const displayName =
        mg === 'wall'
          ? 'Paredes em Steel Frame'
          : mg === 'tr-lsf-laje'
            ? 'Cobertura'
            : prettyLayerRootLabel(rawName, i)
      groups.set(key, { displayName, roots: [] })
    }
    groups.get(key).roots.push(root)
  })

  let layerIdx = 0
  const layers = []
  for (const { displayName, roots: gRoots } of groups.values()) {
    for (const root of gRoots) {
      root.traverse((o) => {
        o.userData[VIZ_LAYER] = layerIdx
      })
    }
    layers.push({ id: layerIdx, name: displayName })
    layerIdx += 1
  }

  raiz.traverse((o) => {
    if (o.userData[VIZ_SKIP_LAYER]) return
    if (o.userData[VIZ_LAYER] === undefined) {
      o.userData[VIZ_LAYER] = -1
    }
  })

  raiz.traverse((o) => {
    if (!isIgnoredLayerRootName(o.name)) return
    o.traverse((x) => {
      x.userData[VIZ_SKIP_LAYER] = true
      x.visible = false
    })
  })

  onLayersReady?.(layers)
}

function aplicarVisibilidadeCamadas(raiz, layerVisibility) {
  raiz.traverse((o) => {
    if (o.userData[VIZ_SKIP_LAYER]) {
      o.visible = false
      return
    }
    const L = o.userData[VIZ_LAYER]
    if (L === undefined || L < 0) {
      o.visible = true
      return
    }
    o.visible = layerVisibility[L] !== false
  })
}

function ParteModelo({ url, layerVisibility, onLayersReady }) {
  const { scene } = useGLTF(url)
  const raiz = useMemo(() => scene.clone(true), [scene])
  const onReadyRef = useRef(onLayersReady)
  onReadyRef.current = onLayersReady
  const debugOnceRef = useRef(false)

  useLayoutEffect(() => {
    aplicarSombras(raiz)
    marcarCamadas(raiz, (layers) => onReadyRef.current?.(layers))
    if (import.meta.env.DEV && !debugOnceRef.current) {
      debugOnceRef.current = true
      logSubgruposEtapaPlacas(raiz)
    }
  }, [raiz])

  useLayoutEffect(() => {
    aplicarVisibilidadeCamadas(raiz, layerVisibility)
  }, [raiz, layerVisibility])

  return <primitive object={raiz} />
}

/** Recalcula enquadramento quando camadas mudam (objetos ocultos saem do bounding box). */
function AjustarBoundsAoMudarCamadas({ layerVisibilityKey }) {
  const bounds = useBounds()
  useLayoutEffect(() => {
    bounds.refresh()
    bounds.clip()
    bounds.fit()
  }, [layerVisibilityKey, bounds])
  return null
}

function GrupoModelosNormalizado({ urls, layerVisibility, onLayersReady }) {
  const groupRef = useRef()
  const bounds = useBounds()
  const urlsKey = urls.join('|')

  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return

    g.scale.setScalar(1)
    g.updateMatrixWorld(true)

    let m = medirMaxDim(g)
    if (m > 1e-9 && m < 0.05) {
      g.scale.setScalar(1000)
      g.updateMatrixWorld(true)
      m = medirMaxDim(g)
    }

    if (m > 1e-9) {
      g.scale.multiplyScalar(ALVO_MAX_DIM / m)
    }
    g.updateMatrixWorld(true)

    const refitar = () => {
      bounds?.refresh()
      bounds?.clip()
      bounds?.fit()
    }
    refitar()
    let idInterno
    const idExterno = requestAnimationFrame(() => {
      idInterno = requestAnimationFrame(refitar)
    })
    return () => {
      cancelAnimationFrame(idExterno)
      if (idInterno != null) cancelAnimationFrame(idInterno)
    }
    // bounds (drei) omitido de deps para não re-escalar a cada render; só quando as URLs mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- urlsKey
  }, [urlsKey])

  return (
    <group ref={groupRef}>
      {urls.map((url) => (
        <ParteModelo key={url} url={url} layerVisibility={layerVisibility} onLayersReady={onLayersReady} />
      ))}
    </group>
  )
}

/** Pivô da órbita mais baixo (perto do chão), para o horizonte não "subir" no ecrã. */
function AlvoOrbitaProximoDaBase() {
  const bounds = useBounds()
  const controls = useThree((s) => s.controls)
  const feito = useRef(false)
  const frames = useRef(0)

  useFrame(() => {
    if (feito.current || !controls || frames.current > 90) return
    frames.current += 1
    bounds.refresh()
    const { center, size } = bounds.getSize()
    if (size.y < 1e-4) return
    const alvoY = center.y - size.y * 0.42
    controls.target.set(center.x, alvoY, center.z)
    controls.update()
    feito.current = true
  })

  return null
}

function CenaComEnquadramento({ children, boundsKey, layerVisibilityKey }) {
  return (
    <Bounds key={boundsKey} fit clip observe margin={1.08} maxDuration={0.75}>
      <Center bottom cacheKey={boundsKey}>
        {children}
      </Center>
      <AjustarBoundsAoMudarCamadas layerVisibilityKey={layerVisibilityKey} />
      <AlvoOrbitaProximoDaBase />
    </Bounds>
  )
}

/**
 * Cena com um ou mais GLB / glTF do empreendimento (ex.: arquitetura + hidrossanitário).
 * @param {Record<number, boolean>} [layerVisibility] — id da camada (0…) → visível; false oculta.
 * @param {(layers: { id: number, name: string }[]) => void} [onLayersReady]
 */
export default function Cena3DEmpreendimento({ modelUrls, layerVisibility = {}, onLayersReady }) {
  const urls = Array.isArray(modelUrls) ? modelUrls : modelUrls ? [modelUrls] : []
  const boundsKey = urls.join('|')
  const layerVisibilityKey = JSON.stringify(layerVisibility)

  return (
    <Canvas
      shadows
      camera={{ position: [6, 4.2, 6.5], fov: 42 }}
      dpr={[1, 2]}
      className="h-full w-full touch-none"
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#d4d4d8']} />
      <ambientLight intensity={0.58} />
      <directionalLight
        position={[8, 14, 7]}
        intensity={1.08}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <directionalLight position={[-6, 5, -4]} intensity={0.32} />
      <hemisphereLight args={['#f0f4f8', '#9ca3af', 0.35]} />

      <Suspense fallback={null}>
        <CenaComEnquadramento boundsKey={boundsKey} layerVisibilityKey={layerVisibilityKey}>
          <GrupoModelosNormalizado
            urls={urls}
            layerVisibility={layerVisibility}
            onLayersReady={onLayersReady}
          />
        </CenaComEnquadramento>
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.42}
        minDistance={0.35}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2 + 0.18}
        minPolarAngle={0.22}
      />
    </Canvas>
  )
}
