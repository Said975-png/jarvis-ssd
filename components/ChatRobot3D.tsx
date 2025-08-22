'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

interface ChatRobot3DProps {
  isVisible: boolean
}

function ChatRobotModel({ isVisible }: { isVisible: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('https://cdn.builder.io/o/assets%2F593c53d93bc14662856f5a8a16f9b13c%2F88fc216c7a7b4bb0a949e0ad51b7ddfb?alt=media&token=e170c830-eccc-4b42-bd56-2ee3b9a06c8e&apiKey=593c53d93bc14662856f5a8a16f9b13c')
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (actions && isVisible) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.reset().fadeIn(0.5).play()
          action.timeScale = 0.8
        }
      })
    }

    return () => {
      if (actions) {
        Object.values(actions).forEach((action) => {
          if (action) {
            action.fadeOut(0.3)
          }
        })
      }
    }
  }, [actions, isVisible])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      const floatY = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
      groupRef.current.position.y = floatY

      // Gentle breathing scale
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05
      groupRef.current.scale.setScalar(breathingScale)

      // Slight rotation for life
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1

      // Smooth appearance animation
      if (isVisible && groupRef.current.scale.x < 1) {
        const currentScale = groupRef.current.scale.x
        const targetScale = breathingScale
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, 0.1))
      }
    }
  })

  return (
    <group ref={groupRef} scale={isVisible ? [1, 1, 1] : [0, 0, 0]}>
      <primitive
        object={scene}
        rotation={[0, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
        position={[0, -0.1, 0]}
      />
    </group>
  )
}

export default function ChatRobot3D({ isVisible }: ChatRobot3DProps) {
  return (
    <div className="chat-robot-3d">
      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          {/* Compact lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[2, 2, 2]}
            intensity={0.8}
            color="#0ea5e9"
          />
          <pointLight
            position={[-1, -1, 1]}
            intensity={0.3}
            color="#3b82f6"
          />

          <ChatRobotModel isVisible={isVisible} />
        </Suspense>
      </Canvas>
    </div>
  )
}
