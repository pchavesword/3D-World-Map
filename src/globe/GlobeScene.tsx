import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DEG } from './geo'
import type { GlobeController } from './GlobeController'
import { useGlobePointer } from './useGlobePointer'

const FOV = 32
/** Fraction of the smaller viewport half-angle the globe fills at zoom 1. */
const FILL = 0.74
const ACCENT = '#2b5bff'

/** Camera distance that frames the unit globe for the current aspect ratio. */
function fitDistance(aspect: number) {
  const halfV = (FOV / 2) * DEG
  const halfH = Math.atan(Math.tan(halfV) * aspect)
  return 1 / Math.sin(Math.min(halfV, halfH) * FILL)
}

function useLowPower() {
  return useMemo(() => window.matchMedia('(max-width: 800px), (pointer: coarse)').matches, [])
}

function Earth({ onReady }: { onReady: () => void }) {
  const low = useLowPower()
  const gl = useThree((s) => s.gl)
  const res = low || gl.capabilities.maxTextureSize < 4096 ? '2k' : '4k'
  const [albedo, normal, height] = useLoader(THREE.TextureLoader, [
    `${import.meta.env.BASE_URL}textures/earth-albedo-${res}.webp`,
    `${import.meta.env.BASE_URL}textures/earth-normal-${res}.webp`,
    `${import.meta.env.BASE_URL}textures/earth-height-${res}.png`,
  ])

  useEffect(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    for (const t of [albedo, normal, height]) {
      t.colorSpace = t === albedo ? THREE.SRGBColorSpace : THREE.NoColorSpace
      t.anisotropy = aniso
      t.wrapS = THREE.RepeatWrapping
      t.needsUpdate = true
    }
    onReady()
  }, [albedo, normal, height, gl, onReady])

  return (
    <mesh>
      <sphereGeometry args={low ? [1, 384, 192] : [1, 768, 384]} />
      <meshStandardMaterial
        map={albedo}
        normalMap={normal}
        normalScale={new THREE.Vector2(1, 1)}
        displacementMap={height}
        displacementScale={0.05}
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  )
}

const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  uniforms: { uColor: { value: new THREE.Color(ACCENT) } },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      // 0 at the outer edge of the shell, rising toward the globe's limb.
      float f = clamp(-normalize(vNormal).z, 0.0, 1.0);
      float a = pow(smoothstep(0.0, 0.62, f), 2.2) * 0.27;
      gl_FragColor = vec4(uColor, a);
    }
  `,
})

function Atmosphere() {
  return (
    <mesh material={atmosphereMaterial}>
      <sphereGeometry args={[1.2, 64, 48]} />
    </mesh>
  )
}

function Rig({ controller, children }: { controller: GlobeController; children: React.ReactNode }) {
  const tilt = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  useGlobePointer(controller)

  useFrame((state, delta) => {
    controller.update(Math.min(delta, 0.1))
    const { lon, lat, zoom } = controller.view
    tilt.current.rotation.x = lat * DEG
    spin.current.rotation.y = -(lon + 90) * DEG
    const cam = state.camera as THREE.PerspectiveCamera
    // Zoom scales the gap between camera and surface, so it never clips the relief.
    const fit = fitDistance(cam.aspect)
    cam.position.set(0, 0, 1 + (fit - 1) / zoom)
  })

  return (
    <group ref={tilt}>
      <group ref={spin}>{children}</group>
    </group>
  )
}

type Props = {
  controller: GlobeController
  onReady: () => void
  children?: React.ReactNode
}

export default function GlobeScene({ controller, onReady, children }: Props) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      camera={{ fov: FOV, near: 0.05, far: 50, position: [0, 0, 5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // The page must stay scrollable; useGlobePointer decides per-gesture.
      style={{ touchAction: 'auto' }}
    >
      {/* Soft studio setup: broad key from upper left, cool fill from below. */}
      <hemisphereLight args={['#ffffff', '#c6cae0', 1.3]} />
      <directionalLight position={[-3.2, 3.4, 4.2]} intensity={1.85} />
      <directionalLight position={[4, -1.5, 2]} intensity={0.25} color="#dde5ff" />
      <Atmosphere />
      <Rig controller={controller}>
        <Suspense fallback={null}>
          <Earth onReady={onReady} />
        </Suspense>
        {children}
      </Rig>
    </Canvas>
  )
}
