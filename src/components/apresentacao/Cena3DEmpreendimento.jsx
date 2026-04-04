import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, OrbitControls, useBounds, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { Box3, Vector3 } from 'three'

/** Maior dimensão do conjunto após normalização (espaço da cena). */
const ALVO_MAX_DIM = 7.5

function medirMaxDim(obj) {
  obj.updateMatrixWorld(true)
  const box = new Box3().setFromObject(obj)
  if (box.isEmpty()) return 0
  const s = box.getSize(new Vector3())
  return Math.max(s.x, s.y, s.z)
}

function ParteModelo({ url }) {
  const { scene } = useGLTF(url)
  const raiz = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    raiz.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [raiz])

  return <primitive object={raiz} />
}

function GrupoModelosNormalizado({ urls }) {
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
        <ParteModelo key={url} url={url} />
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

function CenaComEnquadramento({ children, boundsKey }) {
  return (
    <Bounds key={boundsKey} fit clip observe margin={1.08} maxDuration={0.75}>
      <Center bottom cacheKey={boundsKey}>
        {children}
      </Center>
      <AlvoOrbitaProximoDaBase />
    </Bounds>
  )
}

/**
 * Cena com um ou mais GLB / glTF do empreendimento (ex.: arquitetura + hidrossanitário).
 */
export default function Cena3DEmpreendimento({ modelUrls }) {
  const urls = Array.isArray(modelUrls) ? modelUrls : modelUrls ? [modelUrls] : []
  const boundsKey = urls.join('|')

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
        <CenaComEnquadramento boundsKey={boundsKey}>
          <GrupoModelosNormalizado urls={urls} />
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
