import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'

function WireGlobe({ color = '#46ff8a' }) {
  const group = useRef(null)
  const globe = useRef(null)
  const ringA = useRef(null)
  const ringB = useRef(null)

  const geo = useMemo(() => new THREE.SphereGeometry(1.5, 48, 32), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.1, 0.01, 8, 256), [])

  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.y += dt * 0.22
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.06
    if (globe.current) globe.current.rotation.z -= dt * 0.06
    if (ringA.current) ringA.current.rotation.z += dt * 0.22
    if (ringB.current) ringB.current.rotation.z -= dt * 0.18
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh ref={globe} geometry={geo}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>

      <mesh ref={ringA} geometry={ringGeo} rotation={[Math.PI / 2.7, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringB} geometry={ringGeo} rotation={[Math.PI / 3.8, 0, Math.PI / 4]}>
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>

      <pointLight color={color} intensity={1.1} distance={10} position={[2.8, 1.6, 3.4]} />
      <pointLight color={'#ffffff'} intensity={0.35} distance={10} position={[-3.2, -1.2, -2.2]} />
    </group>
  )
}

function Particles({ count = 900, color = '#46ff8a' }) {
  const points = useRef(null)
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 4.2 + Math.random() * 3.2
      const t = Math.random() * Math.PI * 2
      const p = (Math.random() - 0.5) * Math.PI
      pos[i * 3 + 0] = Math.cos(t) * Math.cos(p) * r
      pos[i * 3 + 1] = Math.sin(p) * r * 0.6
      pos[i * 3 + 2] = Math.sin(t) * Math.cos(p) * r
      size[i] = 0.6 + Math.random() * 1.2
    }
    return { positions: pos, sizes: size }
  }, [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.05
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

export default function Hero3D() {
  return (
    <section id="top" className="hero3d">
      <div className="hero3d-bg" aria-hidden="true">
        <Canvas
          className="hero3d-canvas"
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 6.4], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 8, 18]} />
          <ambientLight intensity={0.25} />
          <WireGlobe />
          <Particles />
          <Environment preset="night" />
        </Canvas>
        <div className="hero3d-vignette" />
        <div className="hero3d-scanlines" />
      </div>

      <header className="hero3d-top">
        <div className="container hero3d-top-inner">
          <div className="hero3d-brand">
            <span className="hero3d-dot" aria-hidden="true" />
            <span className="hero3d-status">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      <div className="container hero3d-center">
        <div className="hero3d-panel">
          <h1 className="hero3d-title" aria-label="Cyber Defense">
            <span className="hero3d-glitch" data-text="CYBER DEFENSE">
              CYBER DEFENSE
            </span>
          </h1>
          <p className="hero3d-subtitle">
            Securing the digital frontier through advanced penetration testing and vulnerability assessment.
          </p>
          <div className="hero3d-actions">
            <a className="btn btn-neon" href="#contact">
              INITIATE PROTOCOL
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

