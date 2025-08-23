'use client'

interface Robot3DProps {
  scrollProgress: number
  currentSection?: number
}

export default function Robot3D({ scrollProgress = 0, currentSection = 0 }: Robot3DProps) {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 255, 0, 0.2)',
        border: '3px solid red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: 2,
        pointerEvents: 'none'
      }}
    >
      ROBOT HERE
      <br />
      Scroll: {scrollProgress.toFixed(1)}
      <br />
      Section: {currentSection}
    </div>
  )
}
