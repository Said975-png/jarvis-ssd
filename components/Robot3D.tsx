'use client'

import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface Robot3DProps {
  scrollProgress: number
  currentSection?: number
}

// Floating particles around robot
function RobotParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null)

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
      particlesRef.current.position.set(...position)
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={50}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#0ea5e9"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  )
}

function RobotModel({ scrollProgress, currentSection = 0 }: { scrollProgress: number; currentSection?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  let scene, animations
  try {
    const gltf = useGLTF('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')
    scene = gltf.scene
    animations = gltf.animations
  } catch (error) {
    console.error('Failed to load GLTF model:', error)
    return null
  }

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
    <group ref={groupRef}>
      {/* Sparkles effect around robot */}
      <Sparkles
        count={30}
        scale={[3, 3, 3]}
        size={2}
        speed={0.3}
        color="#0ea5e9"
        opacity={0.4}
      />

      {/* Floating particles */}
      <RobotParticles position={[0, 0, 0]} />

      {/* Main robot model */}
      <primitive
        object={scene}
        rotation={[0, Math.PI * 0.2, 0]}
        scale={[0.8, 0.8, 0.8]}
      />

      {/* Energy field effect */}
      <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.05}
          wireframe={true}
        />
      </mesh>
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
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.3} />

          {/* Primary dramatic lighting */}
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            color="#0ea5e9"
            castShadow={true}
          />

          {/* Accent lights for depth */}
          <pointLight
            position={[-8, -8, -8]}
            intensity={0.5}
            color="#3b82f6"
          />
          <pointLight
            position={[8, -5, 3]}
            intensity={0.4}
            color="#8b5cf6"
          />

          {/* Moving spotlight for drama */}
          <spotLight
            position={[5, 8, 5]}
            angle={0.3}
            intensity={0.8}
            color="#ffffff"
            penumbra={0.5}
            castShadow={true}
          />

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* Robot Model with effects */}
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
