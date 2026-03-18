'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Environment, ContactShadows, Preload, Text } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function GlassHeroScene() {
  const mesh = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.15
      mesh.current.rotation.y += delta * 0.2
      
      const targetX = state.pointer.x * (viewport.width / 2)
      const targetY = state.pointer.y * (viewport.height / 2)
      
      // Dramatically slowed down the tracking lerp for a very heavy, smooth trailing float
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.018)
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetY, 0.018)
    }
  })

  // Calculate a responsive font size based on the 3D viewport dimensions
  const vw = viewport.width
  const fontSize = Math.max(Math.min(vw * 0.08, 1.2), 0.5)

  return (
    <group position={[0, 0, 0]}>
      
      {/* 3D Typographic Background (Enables true glass refraction physics over text) */}
      <Text
        position={[0, 0.6, -1.5]}
        fontSize={fontSize}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={0.95}
        letterSpacing={-0.03}
        fontWeight={700}
      >
        Map your unconscious.{"\n"}In absolute seconds.
      </Text>

      {/* Hero Glass Orb */}
      <Float floatIntensity={4} rotationIntensity={2} speed={3}>
        <mesh ref={mesh} position={[0, 0, 1.5]} scale={0.8}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshTransmissionMaterial 
            backside={false}
            samples={4}
            thickness={1.5}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.95}
            ior={1.2}
            chromaticAberration={0.08}
            anisotropy={0.1}
            color="#ffffff"
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
          />
        </mesh>
      </Float>
      {/* Subtle light specifically for the glass object */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8ab4f8" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#c58af9" />
    </group>
  )
}

export default function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} eventSource={typeof document !== 'undefined' ? document.body : undefined}>
        <Environment preset="city" />
        <GlassHeroScene />
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      </Canvas>
    </div>
  )
}
