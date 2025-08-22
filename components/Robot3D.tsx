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

      // Creative movement patterns based on scroll progress
      let targetX, targetY, targetZ, targetRotationY, targetScale

      if (scrollProgress <= 1) {
        // First to second section - Spiral entry from top-right
        const progress = scrollProgress
        const spiralAngle = progress * Math.PI * 2

        targetX = Math.cos(spiralAngle) * (2 - progress * 1.5) // Spiral in from right
        targetY = baseY + Math.sin(spiralAngle) * 0.5 + (1 - progress) * 3 // Start from top
        targetZ = Math.sin(spiralAngle) * 0.3 + progress * 0.5
        targetRotationY = spiralAngle * 0.5
        targetScale = 0.5 + progress * 0.3 // Grow as it approaches
      } else {
        // Second to third section - Figure-8 movement
        const secondProgress = scrollProgress - 1
        const figure8Angle = secondProgress * Math.PI * 3

        targetX = Math.sin(figure8Angle) * 1.2 // Figure-8 horizontal
        targetY = baseY + Math.sin(figure8Angle * 2) * 0.4 - secondProgress * 0.8 // Figure-8 vertical + descent
        targetZ = Math.cos(figure8Angle) * 0.6
        targetRotationY = Math.PI * 0.5 + figure8Angle * 0.3
        targetScale = 0.8 + Math.sin(secondProgress * Math.PI) * 0.2 // Pulsating scale
      }

      // Smooth interpolation with different speeds for more organic movement
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.03)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.04)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.035)

      // Dynamic rotation with scroll-based movement
      const baseRotation = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY + baseRotation, 0.02)
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.03
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.02

      // Dynamic scaling
      const currentScale = targetScale || 0.8
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, currentScale, 0.03))
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
