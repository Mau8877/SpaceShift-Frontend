import * as SPLAT from "gsplat"
import { useEffect, useMemo, useRef, useState } from "react"

type Vec3 = [number, number, number]

type SpaceSplatViewerProps = {
  modelUrl: string
  previewUrl?: string
  camera?: {
    position?: Vec3
    lookAt?: Vec3
  }
  className?: string
}

function getOrbitParams(position: Vec3, target: Vec3) {
  const dx = position[0] - target[0]
  const dy = position[1] - target[1]
  const dz = position[2] - target[2]

  const radius = Math.sqrt(dx * dx + dy * dy + dz * dz) || 5
  const beta = Math.asin(-dy / radius)
  const alpha = Math.atan2(dx, -dz)

  return { alpha, beta, radius }
}

export function SpaceSplatViewer({
  modelUrl,
  previewUrl,
  camera,
  className = "",
}: SpaceSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)

  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cameraKey = useMemo(() => JSON.stringify(camera ?? {}), [camera])

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return

    let disposed = false

    setProgress(0)
    setIsReady(false)
    setError(null)

    const container = containerRef.current
    container.innerHTML = ""

    const canvas = document.createElement("canvas")
    canvas.style.display = "block"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.margin = "0"
    canvas.style.padding = "0"

    container.appendChild(canvas)

    const scene = new SPLAT.Scene()
    const splatCamera = new SPLAT.Camera()
    const renderer = new SPLAT.WebGLRenderer(canvas)

    const target = camera?.lookAt ?? [0, 0, 0]
    const position = camera?.position ?? [0, 1.5, 4]

    const orbit = getOrbitParams(position, target)

    const controls = new SPLAT.OrbitControls(
      splatCamera,
      renderer.canvas,
      orbit.alpha,
      orbit.beta,
      orbit.radius,
      true,
      new SPLAT.Vector3(target[0], target[1], target[2])
    )

    const handleResize = () => {
      renderer.resize()
    }

    window.addEventListener("resize", handleResize)

    async function loadModel() {
      try {
        await SPLAT.Loader.LoadAsync(modelUrl, scene, (value: number) => {
          if (disposed) return

          if (typeof value === "number") {
            const normalized = Math.min(Math.max(value, 0), 1)
            setProgress(Math.round(normalized * 100))
          }
        })

        if (disposed) return

        setIsReady(true)

        const frame = () => {
          if (disposed) return

          controls.update()
          renderer.resize()
          renderer.render(scene, splatCamera)

          frameRef.current = requestAnimationFrame(frame)
        }

        frameRef.current = requestAnimationFrame(frame)
      } catch (err) {
        console.error(err)
        setError("No se pudo cargar el modelo 3D.")
      }
    }

    loadModel()

    return () => {
      disposed = true

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }

      window.removeEventListener("resize", handleResize)

      controls.dispose()
      renderer.dispose()

      canvas.remove()
      container.innerHTML = ""
    }
  }, [modelUrl, cameraKey])

  return (
    <div
      className={`relative h-150 w-full overflow-hidden rounded-xl border bg-black ${className}`}
    >
      <div ref={containerRef} className="h-full w-full" />

      {previewUrl && !isReady && (
        <img
          src={previewUrl}
          alt="Vista previa del recorrido 3D"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!isReady && !error && (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-sm text-white">
          Cargando recorrido 3D... {progress > 0 ? `${progress}%` : ""}
        </div>
      )}

      {error && (
        <div className="absolute inset-x-4 top-4 rounded-md bg-red-500 px-4 py-3 text-sm text-white">
          {error}
        </div>
      )}
    </div>
  )
}
