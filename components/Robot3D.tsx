'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface Robot3DProps {
  scrollProgress: number
  currentSection?: number
}

function RobotModel({ scrollProgress, currentSection = 0 }: { scrollProgress: number; currentSection?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')
  const { actions, mixer } = useAnimations(animations, groupRef)

  useEffect(() => {
    // Play all available animations
    if (actions) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.reset().fadeIn(0.5).play()
          // Set animation speed based on section
          action.timeScale = currentSection === 0 ? 1 : 0.7
        }
      })
    }

    return () => {
      // Cleanup animations on unmount
      if (actions) {
        Object.values(actions).forEach((action) => {
          if (action) {
            action.fadeOut(0.5)
          }
        })
      }
    }
  }, [actions, currentSection])

  useFrame((state) => {
    if (groupRef.current) {
      // Slow floating animation
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      const baseY = -1 + floatY

      // Animate position based on scroll progress
      let targetX, targetY, targetZ

      if (scrollProgress <= 1) {
        // First to second section
        targetX = THREE.MathUtils.lerp(1, -0.5, scrollProgress)
        targetY = THREE.MathUtils.lerp(baseY, baseY + 0.3, scrollProgress)
        targetZ = THREE.MathUtils.lerp(-1, 0.5, scrollProgress)
      } else {
        // Second to third section
        const secondProgress = scrollProgress - 1
        targetX = THREE.MathUtils.lerp(-0.5, 0, secondProgress)
        targetY = THREE.MathUtils.lerp(baseY + 0.3, baseY - 0.5, secondProgress)
        targetZ = THREE.MathUtils.lerp(0.5, -0.5, secondProgress)
      }

      // Smooth interpolation
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05)

      // Rotation animation
      const rotationProgress = Math.min(scrollProgress, 2)
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 + (rotationProgress * Math.PI * 0.25)
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

export default function Robot3D({ scrollProgress = 0, currentSection = 0 }: Robot3DProps) {
  return (
    <div className="robot-3d-container">
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 50,
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
          <RobotModel scrollProgress={scrollProgress} currentSection={currentSection} />
          
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
