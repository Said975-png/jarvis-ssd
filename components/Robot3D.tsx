'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface Robot3DProps {
  scrollProgress: number
}

function RobotModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')

  useFrame((state) => {
    if (groupRef.current) {
      // Slow floating animation
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      const baseY = -1 + floatY

      // Animate position based on scroll progress
      const targetX = THREE.MathUtils.lerp(2, -2, scrollProgress)
      const targetY = THREE.MathUtils.lerp(baseY, baseY + 1, scrollProgress)
      const targetZ = THREE.MathUtils.lerp(-2, 0, scrollProgress)

      // Smooth interpolation
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05)

      // Rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 + (scrollProgress * Math.PI)
    }
  })

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      <primitive
        object={scene}
        rotation={[0, Math.PI * 0.2, 0]}
      />
    </group>
  )
}

function Loader() {
  return (
    <div className="robot-loader">
      <div className="loader-spinner" />
    </div>
  )
}

export default function Robot3D({ scrollProgress = 0 }: Robot3DProps) {
  return (
    <div className="robot-3d-container">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            color="#0ea5e9"
          />
          <pointLight 
            position={[-10, -10, -10]} 
            intensity={0.3}
            color="#3b82f6"
          />
          
          {/* Environment for reflections */}
          <Environment preset="night" />
          
          {/* Robot Model */}
          <RobotModel scrollProgress={scrollProgress} />
          
          {/* Controls - disabled for background effect */}
          <OrbitControls 
            enabled={false}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')
