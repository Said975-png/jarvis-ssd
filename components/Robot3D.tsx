'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

function RobotModel() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')

  useFrame((state) => {
    if (groupRef.current) {
      // Slow floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[2, -1, -2]} scale={[0.8, 0.8, 0.8]}>
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

export default function Robot3D() {
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
          <RobotModel />
          
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
