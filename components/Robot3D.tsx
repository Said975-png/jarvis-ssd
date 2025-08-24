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
        size={0.015}
        color="#0ea5e9"
        transparent
        opacity={0.35}
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

  // CRITICAL: ALL hooks must be called at the top level before any conditional logic!
  const { actions, mixer } = useAnimations(gltf?.animations || [], groupRef)

  // Handle successful model load
  useEffect(() => {
    if (gltf && gltf.scene && !modelError && !isRetrying) {
      setIsLoaded(true)
      setModelError(false)
    }
  }, [gltf, modelError, isRetrying])

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
          action.reset().play()
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
            action.stop()
          }
        })
      }
    }
  }, [actions, currentSection, isLoaded, modelError, isRetrying])

  // Make robot model transparent
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.transparent = true
              mat.opacity = 0.3 // More transparent and ethereal
            })
          } else {
            child.material.transparent = true
            child.material.opacity = 0.3 // More transparent and ethereal
          }
        }
      })
    }
  }, [gltf?.scene])

  // CRITICAL: useFrame must also be called before any conditional returns!
  useFrame((state) => {
    // Only animate if we have a valid ref and the model is loaded
    if (groupRef.current && isLoaded && !modelError && !isRetrying && gltf?.scene) {
      // Initialize position immediately on first frame if needed
      const needsInitialPosition = groupRef.current.position.x === 0 && groupRef.current.position.y === 0 && groupRef.current.position.z === 0

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
        targetX = Math.cos(orbitAngle) * (1.0 - progress * 0.3) + 0.8 // More visible and closer
        targetY = baseY + Math.sin(orbitAngle) * 0.3 + progress * 0.2 // Gentle vertical movement
        targetZ = Math.sin(progress * Math.PI) * 0.4 + 0.6 // Move even more forward to be clearly visible
        targetRotationY = orbitAngle * 0.3 + state.clock.elapsedTime * 0.05
        targetScale = 1.0 + progress * 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      } else if (safeScrollProgress <= 2) {
        // Advantages to Pricing - Interactive dance
        const secondProgress = Math.max(0, Math.min(safeScrollProgress - 1, 1))
        const danceTime = state.clock.elapsedTime * 0.3 + secondProgress * 2

        // Dancing motion with bounds
        targetX = Math.sin(danceTime) * 0.6 + Math.cos(danceTime * 0.7) * 0.3 // Dancing left-right
        targetY = baseY + Math.sin(danceTime * 1.3) * 0.25 + Math.cos(secondProgress * Math.PI) * 0.3 // Up-down dance
        targetZ = Math.cos(danceTime * 0.9) * 0.4 + secondProgress * 0.2 + 0.4 // Forward-back rhythm
        targetRotationY = danceTime * 0.4 + Math.sin(danceTime * 0.6) * 0.3
        targetScale = 0.8 + Math.sin(danceTime * 2) * 0.1 // Rhythmic pulsing
      } else if (safeScrollProgress <= 3) {
        // Pricing to AI Consultant - Thoughtful presentation
        const thirdProgress = Math.max(0, Math.min(safeScrollProgress - 2, 1))
        const presentationTime = state.clock.elapsedTime * 0.2 + thirdProgress * 1.5

        // Consultant-like movement - more professional and focused
        targetX = Math.sin(presentationTime * 0.8) * 0.4 + Math.cos(thirdProgress * Math.PI * 0.5) * 0.2 // Subtle side movement
        targetY = baseY + Math.sin(presentationTime * 0.6) * 0.15 + thirdProgress * 0.3 // Rising motion for authority
        targetZ = Math.cos(presentationTime * 0.5) * 0.3 + Math.sin(thirdProgress * Math.PI) * 0.25 + 0.4 // Forward presentation stance
        targetRotationY = presentationTime * 0.2 + Math.sin(thirdProgress * Math.PI) * 0.1 // Gentle rotation
        targetScale = 0.85 + Math.sin(presentationTime * 1.5) * 0.08 + thirdProgress * 0.1 // Authoritative scale
      } else {
        // AI Consultant to Reviews - Confident finale
        const fourthProgress = Math.max(0, Math.min(safeScrollProgress - 3, 1))
        const finaleTime = state.clock.elapsedTime * 0.25 + fourthProgress * 2

        // Victory dance - confident and celebratory
        targetX = Math.sin(finaleTime) * 0.5 + Math.cos(finaleTime * 1.2) * 0.2 // Triumphant movement
        targetY = baseY + Math.sin(finaleTime * 1.1) * 0.2 + Math.cos(fourthProgress * Math.PI) * 0.4 // Elevated position
        targetZ = Math.cos(finaleTime * 0.8) * 0.35 + fourthProgress * 0.15 + 0.4 // Forward confident stance
        targetRotationY = finaleTime * 0.3 + Math.sin(fourthProgress * Math.PI) * 0.2 // Confident rotation
        targetScale = 0.9 + Math.sin(finaleTime * 1.8) * 0.12 + fourthProgress * 0.05 // Larger, more confident
      }

      // Extra safety clamps to ensure robot stays visible
      targetX = Math.max(-1.5, Math.min(1.5, targetX))
      targetY = Math.max(-2, Math.min(2, targetY))
      targetZ = Math.max(-0.2, Math.min(1.2, targetZ)) // Ensure Z never goes too far back

      // Set initial position immediately if needed, otherwise smooth interpolation
      if (needsInitialPosition) {
        // Jump directly to first visible position
        groupRef.current.position.set(targetX, targetY, targetZ)
        groupRef.current.scale.setScalar(targetScale)
      } else {
        // Smooth interpolation for ongoing animation
        const lerpSpeed = 0.08
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, lerpSpeed)
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed)
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, lerpSpeed)

        // Breathing scale animation
        const breathingScale = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
        const finalScale = Math.max(0.3, Math.min(1.2, targetScale + breathingScale))
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, finalScale, 0.08))
      }

      // Engaging rotation with personality
      const personalityRotation = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY + personalityRotation, 0.05)
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04 + Math.cos(safeScrollProgress * 2) * 0.02
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03
    }
  })

  // NOW we can safely use conditional logic after all hooks have been called

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

  return (
    <group ref={groupRef}>
      {/* Sparkles effect around robot */}
      <Sparkles
        count={20}
        scale={[3, 3, 3]}
        size={1.5}
        speed={0.3}
        color="#0ea5e9"
        opacity={0.25}
      />

      {/* Floating particles */}
      <RobotParticles position={[0, 0, 0]} />

      {/* 3D модель и сферы удалены */}
    </group>
  )
}

function FallbackRobot({ scrollProgress, currentSection }: { scrollProgress: number; currentSection: number }) {
  const fallbackRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (fallbackRef.current) {
      // Initialize position immediately on first frame if needed
      const needsInitialPosition = fallbackRef.current.position.x === 0 && fallbackRef.current.position.y === 0 && fallbackRef.current.position.z === 0

      // Same animation logic as the real robot
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      const baseY = -1 + floatY

      const safeScrollProgress = Math.max(0, Math.min(scrollProgress, 4))

      let targetX, targetY, targetZ, targetRotationY, targetScale

      if (safeScrollProgress <= 1) {
        const progress = safeScrollProgress
        const orbitAngle = progress * Math.PI + state.clock.elapsedTime * 0.1

        // Positioned to be visible but not intrusive
        targetX = Math.cos(orbitAngle) * (1.0 - progress * 0.3) + 0.8
        targetY = baseY + Math.sin(orbitAngle) * 0.3 + progress * 0.2
        targetZ = Math.sin(progress * Math.PI) * 0.4 + 0.6
        targetRotationY = orbitAngle * 0.3 + state.clock.elapsedTime * 0.05
        targetScale = 0.8 + progress * 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      } else {
        const secondProgress = Math.max(0, Math.min(safeScrollProgress - 1, 1))
        const danceTime = state.clock.elapsedTime * 0.3 + secondProgress * 2

        targetX = Math.sin(danceTime) * 0.6 + Math.cos(danceTime * 0.7) * 0.3
        targetY = baseY + Math.sin(danceTime * 1.3) * 0.25 + Math.cos(secondProgress * Math.PI) * 0.3
        targetZ = Math.cos(danceTime * 0.9) * 0.4 + secondProgress * 0.2 + 0.4
        targetRotationY = danceTime * 0.4 + Math.sin(danceTime * 0.6) * 0.3
        targetScale = 0.6 + Math.sin(danceTime * 2) * 0.1
      }

      targetX = Math.max(-1.5, Math.min(1.5, targetX))
      targetY = Math.max(-2, Math.min(2, targetY))
      targetZ = Math.max(-0.2, Math.min(1.2, targetZ))

      // Set initial position immediately if needed, otherwise smooth interpolation
      if (needsInitialPosition) {
        fallbackRef.current.position.set(targetX, targetY, targetZ)
        fallbackRef.current.scale.setScalar(targetScale)
      } else {
        // Smooth interpolation for ongoing animation
        const lerpSpeed = 0.08
        fallbackRef.current.position.x = THREE.MathUtils.lerp(fallbackRef.current.position.x, targetX, lerpSpeed)
        fallbackRef.current.position.y = THREE.MathUtils.lerp(fallbackRef.current.position.y, targetY, lerpSpeed)
        fallbackRef.current.position.z = THREE.MathUtils.lerp(fallbackRef.current.position.z, targetZ, lerpSpeed)

        const breathingScale = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
        const finalScale = Math.max(0.3, Math.min(1.2, targetScale + breathingScale))
        fallbackRef.current.scale.setScalar(THREE.MathUtils.lerp(fallbackRef.current.scale.x, finalScale, 0.08))
      }

      const personalityRotation = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
      fallbackRef.current.rotation.y = THREE.MathUtils.lerp(fallbackRef.current.rotation.y, targetRotationY + personalityRotation, 0.05)
      fallbackRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04
      fallbackRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03
    }
  })

  return (
    <group ref={fallbackRef} scale={[2, 2, 2]}>
      {/* Sparkles effect around fallback robot */}
      <Sparkles
        count={20}
        scale={[3, 3, 3]}
        size={1.5}
        speed={0.4}
        color="#0ea5e9"
        opacity={0.3}
      />

      {/* Fallback geometric robot body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 1.5, 0.8]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.1}
          transparent
          opacity={0.3}
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

      {/* Сферы удалены */}
    </group>
  )
}

function LoadingFallback() {
  const loadingRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (loadingRef.current) {
      // Set initial position immediately on first frame
      if (loadingRef.current.position.x === 0 && loadingRef.current.position.y === 0 && loadingRef.current.position.z === 0) {
        loadingRef.current.position.set(0.8, -0.8, 0.6)
        loadingRef.current.scale.setScalar(0.6)
      }

      loadingRef.current.rotation.y = state.clock.elapsedTime * 0.5
      loadingRef.current.position.y = -0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2
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
  const [canvasReady, setCanvasReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Force canvas to re-render and be ready
  useEffect(() => {
    if (!isClient) return

    // Set canvas as ready after a brief delay to ensure proper initialization
    const timer = setTimeout(() => {
      setCanvasReady(true)
    }, 100)

    // Add resize handler to force canvas refresh
    const handleResize = () => {
      setCanvasReady(false)
      setTimeout(() => setCanvasReady(true), 50)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [isClient])

  // Don't render on server side
  if (!isClient) {
    return <Loader />
  }

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
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        onCreated={(state) => {
          // Force initial render when canvas is created
          state.invalidate()
          setCanvasReady(true)
        }}
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

          {/* Only render robot when canvas is ready */}
          {canvasReady && <RobotModel scrollProgress={scrollProgress} currentSection={currentSection} />}

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
