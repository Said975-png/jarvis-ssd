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

      // Engaging movement patterns with safe boundaries
      let targetX, targetY, targetZ, targetRotationY, targetScale

      // Clamp scroll progress to prevent extreme values
      const safeScrollProgress = Math.max(0, Math.min(scrollProgress, 2))

      if (safeScrollProgress <= 1) {
        // Hero section - Gentle orbit movement
        const progress = safeScrollProgress
        const orbitAngle = progress * Math.PI + state.clock.elapsedTime * 0.1

        // Keep within safe bounds [-1.5, 1.5] for X and Y
        targetX = Math.cos(orbitAngle) * (0.8 - progress * 0.3) // Orbit movement, contained
        targetY = baseY + Math.sin(orbitAngle) * 0.3 + progress * 0.2 // Gentle vertical movement
        targetZ = Math.sin(progress * Math.PI) * 0.4 // Forward and back
        targetRotationY = orbitAngle * 0.3 + state.clock.elapsedTime * 0.05
        targetScale = 0.7 + progress * 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      } else {
        // Advantages/Pricing sections - Interactive dance
        const secondProgress = Math.max(0, Math.min(safeScrollProgress - 1, 1))
        const danceTime = state.clock.elapsedTime * 0.3 + secondProgress * 2

        // Dancing motion with bounds
        targetX = Math.sin(danceTime) * 0.6 + Math.cos(danceTime * 0.7) * 0.3 // Dancing left-right
        targetY = baseY + Math.sin(danceTime * 1.3) * 0.25 + Math.cos(secondProgress * Math.PI) * 0.3 // Up-down dance
        targetZ = Math.cos(danceTime * 0.9) * 0.4 + secondProgress * 0.2 // Forward-back rhythm
        targetRotationY = danceTime * 0.4 + Math.sin(danceTime * 0.6) * 0.3
        targetScale = 0.8 + Math.sin(danceTime * 2) * 0.1 // Rhythmic pulsing
      }

      // Extra safety clamps to ensure robot stays visible
      targetX = Math.max(-1.5, Math.min(1.5, targetX))
      targetY = Math.max(-2, Math.min(2, targetY))
      targetZ = Math.max(-1, Math.min(1, targetZ))

      // Smooth interpolation with organic feel
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.04)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.045)

      // Engaging rotation with personality
      const personalityRotation = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY + personalityRotation, 0.03)
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04 + Math.cos(safeScrollProgress * 2) * 0.02
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03

      // Breathing scale animation
      const breathingScale = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
      const finalScale = Math.max(0.3, Math.min(1.2, targetScale + breathingScale))
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, finalScale, 0.04))
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
