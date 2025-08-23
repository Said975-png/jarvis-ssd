'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import styles from './Robot3D.module.css'

interface Robot3DProps {
  scrollProgress: number
  currentSection?: number
}

function SimpleRobot({ scrollProgress, currentSection = 0 }: { scrollProgress: number; currentSection?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Простая анимация
      const time = state.clock.elapsedTime
      groupRef.current.rotation.y = time * 0.5
      groupRef.current.position.y = Math.sin(time * 2) * 0.3
      groupRef.current.position.x = 0
      groupRef.current.position.z = 0
    }
  })

  return (
    <group ref={groupRef}>
      {/* Яркие Sparkles для проверки */}
      <Sparkles
        count={50}
        scale={[3, 3, 3]}
        size={4}
        speed={0.5}
        color="#00ff00"
        opacity={1}
      />

      {/* Главное тело робота - ярко-синий куб */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.5, 0.8]} />
        <meshStandardMaterial
          color="#0000ff"
          emissive="#0000ff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Голова робота - зеленая сфера */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Руки робота - красные цилиндры */}
      <mesh position={[-0.8, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.8, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Энергетическое поле - желтая wireframe сфера */}
      <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.3}
          wireframe={true}
        />
      </mesh>
    </group>
  )
}

export default function Robot3D({ scrollProgress = 0, currentSection = 0 }: Robot3DProps) {
  return (
    <div className={styles['robot-3d-container']}>
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default"
        }}
        style={{ background: 'rgba(255, 0, 0, 0.3)' }} // Полупрозрачный красный фон для видимости canvas
      >
        <Suspense fallback={null}>
          {/* Яркое освещение */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            color="#ffffff"
          />
          <pointLight
            position={[-5, -5, -5]}
            intensity={0.5}
            color="#ffffff"
          />

          {/* Простой робот */}
          <SimpleRobot scrollProgress={scrollProgress} currentSection={currentSection} />
        </Suspense>
      </Canvas>
    </div>
  )
}
