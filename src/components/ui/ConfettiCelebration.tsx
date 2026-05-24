import { useEffect, useRef } from "react"

interface ConfettiCelebrationProps {
  active: boolean
}

export function ConfettiCelebration({ active }: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Colores premium (Ambar, Azul, Esmeralda, Violeta, Rosa)
    const colors = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#E11D48"]
    const particles: Array<{
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      rotation: number
      rotationSpeed: number
      opacity: number
    }> = []

    // Inicializar 180 partículas de confeti con trayectorias naturales
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - 20, // Empiezan por encima de la pantalla
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 3 - 1.5,
        opacity: 1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      let activeParticles = 0

      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        p.rotation += p.rotationSpeed

        // Gravedad y fricción suave
        p.speedY += 0.05
        p.speedX *= 0.99

        // Desvanecimiento al final del trayecto
        if (p.y > height * 0.7) {
          p.opacity -= 0.02
        }

        if (p.y < height && p.opacity > 0) {
          activeParticles++
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          
          // Dibujar rectángulos rotados representando el confeti
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        }
      })

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    />
  )
}
