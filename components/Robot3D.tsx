'use client'

import { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import styles from './Robot3D.module.css'

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
  const [modelError, setModelError] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)

  const modelUrl = 'https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c'

  // Load GLTF model with error handling
  const gltf = useGLTF(modelUrl,
    (loadedGltf) => {
      setIsLoaded(true)
      setModelError(false)
      setIsRetrying(false)
    },
    (progress) => {
      // Loading progress tracking (optional)
    },
    (error) => {
      setModelError(true)
      setIsRetrying(false)

      // Retry up to 3 times
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          setIsRetrying(true)
          setModelError(false)
        }, 2000)
      }
    }
  )

  // Handle successful model load
  useEffect(() => {
    if (gltf && gltf.scene && !modelError && !isRetrying) {
      setIsLoaded(true)
      setModelError(false)
    }
  }, [gltf, modelError, isRetrying])

  // CRITICAL: Always call ALL hooks BEFORE any conditional returns!
  const { actions, mixer } = useAnimations(gltf?.animations || [], groupRef)

  // Reset retry counter when model loads successfully
  useEffect(() => {
    if (isLoaded) {
      setRetryCount(0)
    }
  }, [isLoaded])

  // Play all available animations when they're ready
  useEffect(() => {
    // Only run if we have actions and the model is loaded
    if (actions && isLoaded && !modelError && !isRetrying) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.reset().fadeIn(0.5).play()
          // Set animation speed based on section
          if (currentSection === 0) {
            action.timeScale = 1 // Hero - normal speed
          } else if (currentSection === 1) {
            action.timeScale = 0.8 // Advantages - slightly slower
          } else if (currentSection === 2) {
            action.timeScale = 0.7 // Pricing - slower, more thoughtful
          } else if (currentSection === 3) {
            action.timeScale = 0.6 // AI Consultant - professional, measured
          } else {
            action.timeScale = 0.9 // Reviews - confident finale
          }
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
  }, [actions, currentSection, isLoaded, modelError, isRetrying])

  // CRITICAL: useFrame must also be called before any conditional returns!
  useFrame((state) => {
    // Only animate if we have a valid ref and the model is loaded
    if (groupRef.current && isLoaded && !modelError && !isRetrying && gltf?.scene) {
      // Slow floating animation
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      const baseY = -1 + floatY

      // Engaging movement patterns with safe boundaries
      let targetX, targetY, targetZ, targetRotationY, targetScale

      // Clamp scroll progress to prevent extreme values (now supports 5 sections: 0-4)
      const safeScrollProgress = Math.max(0, Math.min(scrollProgress, 4))

      if (safeScrollProgress <= 1) {
        // Hero to Advantages - Gentle orbit movement
        const progress = safeScrollProgress
        const orbitAngle = progress * Math.PI + state.clock.elapsedTime * 0.1

        // Keep within safe bounds [-1.5, 1.5] for X and Y
        // Start robot visible from the beginning (even when scroll is 0)
        targetX = Math.cos(orbitAngle) * (1.2 - progress * 0.3) + 1.0 // More visible
        targetY = baseY + Math.sin(orbitAngle) * 0.3 + progress * 0.2 // Gentle vertical movement
        targetZ = Math.sin(progress * Math.PI) * 0.4 + 0.2 // Move forward to be more visible
        targetRotationY = orbitAngle * 0.3 + state.clock.elapsedTime * 0.05
        targetScale = 1.0 + progress * 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      } else if (safeScrollProgress <= 2) {
        // Advantages to Pricing - Interactive dance
        const secondProgress = Math.max(0, Math.min(safeScrollProgress - 1, 1))
        const danceTime = state.clock.elapsedTime * 0.3 + secondProgress * 2

        // Dancing motion with bounds
        targetX = Math.sin(danceTime) * 0.6 + Math.cos(danceTime * 0.7) * 0.3 // Dancing left-right
        targetY = baseY + Math.sin(danceTime * 1.3) * 0.25 + Math.cos(secondProgress * Math.PI) * 0.3 // Up-down dance
        targetZ = Math.cos(danceTime * 0.9) * 0.4 + secondProgress * 0.2 // Forward-back rhythm
        targetRotationY = danceTime * 0.4 + Math.sin(danceTime * 0.6) * 0.3
        targetScale = 0.8 + Math.sin(danceTime * 2) * 0.1 // Rhythmic pulsing
      } else if (safeScrollProgress <= 3) {
        // Pricing to AI Consultant - Thoughtful presentation
        const thirdProgress = Math.max(0, Math.min(safeScrollProgress - 2, 1))
        const presentationTime = state.clock.elapsedTime * 0.2 + thirdProgress * 1.5

        // Consultant-like movement - more professional and focused
        targetX = Math.sin(presentationTime * 0.8) * 0.4 + Math.cos(thirdProgress * Math.PI * 0.5) * 0.2 // Subtle side movement
        targetY = baseY + Math.sin(presentationTime * 0.6) * 0.15 + thirdProgress * 0.3 // Rising motion for authority
        targetZ = Math.cos(presentationTime * 0.5) * 0.3 + Math.sin(thirdProgress * Math.PI) * 0.25 // Forward presentation stance
        targetRotationY = presentationTime * 0.2 + Math.sin(thirdProgress * Math.PI) * 0.1 // Gentle rotation
        targetScale = 0.85 + Math.sin(presentationTime * 1.5) * 0.08 + thirdProgress * 0.1 // Authoritative scale
      } else {
        // AI Consultant to Reviews - Confident finale
        const fourthProgress = Math.max(0, Math.min(safeScrollProgress - 3, 1))
        const finaleTime = state.clock.elapsedTime * 0.25 + fourthProgress * 2

        // Victory dance - confident and celebratory
        targetX = Math.sin(finaleTime) * 0.5 + Math.cos(finaleTime * 1.2) * 0.2 // Triumphant movement
        targetY = baseY + Math.sin(finaleTime * 1.1) * 0.2 + Math.cos(fourthProgress * Math.PI) * 0.4 // Elevated position
        targetZ = Math.cos(finaleTime * 0.8) * 0.35 + fourthProgress * 0.15 // Forward confident stance
        targetRotationY = finaleTime * 0.3 + Math.sin(fourthProgress * Math.PI) * 0.2 // Confident rotation
        targetScale = 0.9 + Math.sin(finaleTime * 1.8) * 0.12 + fourthProgress * 0.05 // Larger, more confident
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

  // Show fallback if model failed to load after all retries
  if (modelError && retryCount >= 3) {
    return <FallbackRobot scrollProgress={scrollProgress} currentSection={currentSection} />
  }

  // Show retry message if retrying
  if (isRetrying && !isLoaded) {
    return (
      <group>
        <LoadingFallback />
      </group>
    )
  }

  // Don't render if model hasn't loaded yet
  if (!isLoaded || !gltf?.scene) {
    return <LoadingFallback />
  }

  const { scene } = gltf

  // Now we can safely use the scene since we've passed all the early returns and all hooks are called

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
          opacity={0.15}
          wireframe={true}
        />
      </mesh>
    </group>
  )
}

function FallbackRobot({ scrollProgress, currentSection }: { scrollProgress: number; currentSection: number }) {
  const fallbackRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (fallbackRef.current) {
      // Same animation logic as the real robot
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      const baseY = -1 + floatY

      const safeScrollProgress = Math.max(0, Math.min(scrollProgress, 2))

      let targetX, targetY, targetZ, targetRotationY, targetScale

      if (safeScrollProgress <= 1) {
        const progress = safeScrollProgress
        const orbitAngle = progress * Math.PI + state.clock.elapsedTime * 0.1

        // Positioned to be visible but not intrusive
        targetX = Math.cos(orbitAngle) * (1.8 - progress * 0.3) + 1.2
        targetY = baseY + Math.sin(orbitAngle) * 0.3 + progress * 0.2
        targetZ = Math.sin(progress * Math.PI) * 0.4 + 0.3
        targetRotationY = orbitAngle * 0.3 + state.clock.elapsedTime * 0.05
        targetScale = 1.5 + progress * 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      } else {
        const secondProgress = Math.max(0, Math.min(safeScrollProgress - 1, 1))
        const danceTime = state.clock.elapsedTime * 0.3 + secondProgress * 2

        targetX = Math.sin(danceTime) * 0.6 + Math.cos(danceTime * 0.7) * 0.3
        targetY = baseY + Math.sin(danceTime * 1.3) * 0.25 + Math.cos(secondProgress * Math.PI) * 0.3
        targetZ = Math.cos(danceTime * 0.9) * 0.4 + secondProgress * 0.2
        targetRotationY = danceTime * 0.4 + Math.sin(danceTime * 0.6) * 0.3
        targetScale = 0.8 + Math.sin(danceTime * 2) * 0.1
      }

      targetX = Math.max(-1.5, Math.min(1.5, targetX))
      targetY = Math.max(-2, Math.min(2, targetY))
      targetZ = Math.max(-1, Math.min(1, targetZ))

      fallbackRef.current.position.x = THREE.MathUtils.lerp(fallbackRef.current.position.x, targetX, 0.04)
      fallbackRef.current.position.y = THREE.MathUtils.lerp(fallbackRef.current.position.y, targetY, 0.05)
      fallbackRef.current.position.z = THREE.MathUtils.lerp(fallbackRef.current.position.z, targetZ, 0.045)

      const personalityRotation = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
      fallbackRef.current.rotation.y = THREE.MathUtils.lerp(fallbackRef.current.rotation.y, targetRotationY + personalityRotation, 0.03)
      fallbackRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04
      fallbackRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03

      const breathingScale = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
      const finalScale = Math.max(0.3, Math.min(1.2, targetScale + breathingScale))
      fallbackRef.current.scale.setScalar(THREE.MathUtils.lerp(fallbackRef.current.scale.x, finalScale, 0.04))
    }
  })

  return (
    <group ref={fallbackRef} scale={[2, 2, 2]}>
      {/* Sparkles effect around fallback robot */}
      <Sparkles
        count={30}
        scale={[3, 3, 3]}
        size={2}
        speed={0.4}
        color="#0ea5e9"
        opacity={0.8}
      />

      {/* Fallback geometric robot body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 1.5, 0.8]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Robot head */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Robot eyes */}
      <mesh position={[-0.15, 1.05, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, 1.05, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Robot arms */}
      <mesh position={[-0.9, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.0]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.9, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.0]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Energy field effect */}
      <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.25}
          wireframe={true}
        />
      </mesh>

      {/* Additional glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 8, 8]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

function LoadingFallback() {
  const loadingRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (loadingRef.current) {
      loadingRef.current.rotation.y = state.clock.elapsedTime * 0.5
      loadingRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group ref={loadingRef}>
      {/* Simple loading animation with geometric shapes */}
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#0ea5e9"
          transparent
          opacity={0.6}
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Spinning animation for loading state */}
      <mesh>
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}

function Loader() {
  return (
    <div className={styles['robot-loader']}>
      <div className={styles['loader-spinner']} />
    </div>
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
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<LoadingFallback />}>
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
