import * as pc from "playcanvas"
import { useEffect, useMemo, useRef, useState } from "react"

type Vec3 = [number, number, number]

type SpaceSogViewerProps = {
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
  // elevación (ángulo sobre el plano XZ) y azimut
  const elevation = Math.asin(Math.max(-1, Math.min(1, dy / radius)))
  const azimuth = Math.atan2(dx, dz)

  return { azimuth, elevation, radius }
}

/**
 * Visor de modelos Gaussian Splatting en formato .sog (Self-Organizing Gaussians),
 * que gsplat no soporta. Usa el motor de PlayCanvas (asset type "gsplat", que decodifica .sog).
 * Implementa un control de órbita mínimo con eventos de puntero nativos.
 */
export function SpaceSogViewer({
  modelUrl,
  previewUrl,
  camera,
  className = "",
}: SpaceSogViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cameraKey = useMemo(() => JSON.stringify(camera ?? {}), [camera])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !modelUrl) return

    let disposed = false
    setIsReady(false)
    setError(null)

    container.innerHTML = ""

    const canvas = document.createElement("canvas")
    canvas.style.display = "block"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    container.appendChild(canvas)

    let app: pc.Application | null = null

    try {
      app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
        graphicsDeviceOptions: { antialias: true, alpha: false },
      })
    } catch (err) {
      console.error(err)
      setError("No se pudo inicializar el visor 3D.")
      return
    }

    app.setCanvasFillMode(pc.FILLMODE_NONE)
    app.setCanvasResolution(pc.RESOLUTION_AUTO)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) {
        app?.resizeCanvas(w, h)
      }
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    // --- Cámara ---
    const cameraEntity = new pc.Entity("camera")
    cameraEntity.addComponent("camera", {
      clearColor: new pc.Color(0, 0, 0, 1),
      fov: 60,
    })
    app.root.addChild(cameraEntity)

    const target = camera?.lookAt ?? [0, 0, 0]
    const position = camera?.position ?? [0, 1.5, 4]
    const orbit = getOrbitParams(position, target)

    let azimuth = orbit.azimuth
    let elevation = orbit.elevation
    let distance = orbit.radius
    const targetVec = new pc.Vec3(target[0], target[1], target[2])

    const updateCamera = () => {
      const cosEl = Math.cos(elevation)
      const x = targetVec.x + distance * cosEl * Math.sin(azimuth)
      const y = targetVec.y + distance * Math.sin(elevation)
      const z = targetVec.z + distance * cosEl * Math.cos(azimuth)
      cameraEntity.setPosition(x, y, z)
      cameraEntity.lookAt(targetVec.x, targetVec.y, targetVec.z)
    }
    updateCamera()

    // --- Órbita con puntero ---
    let dragging = false
    let lastX = 0
    let lastY = 0
    const EL_LIMIT = Math.PI / 2 - 0.05

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      azimuth -= dx * 0.005
      elevation = Math.max(-EL_LIMIT, Math.min(EL_LIMIT, elevation + dy * 0.005))
    }
    const onPointerUp = (e: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId)
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      distance = Math.max(0.5, Math.min(50, distance * (1 + e.deltaY * 0.001)))
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("wheel", onWheel, { passive: false })

    app.on("update", updateCamera)
    app.start()

    // --- Cargar modelo .sog ---
    app.assets.loadFromUrl(modelUrl, "gsplat", (err, asset) => {
      if (disposed) return
      if (err || !asset) {
        console.error("Error cargando .sog:", err)
        setError("No se pudo cargar el modelo 3D (.sog).")
        return
      }
      const entity = new pc.Entity("sog-model")
      entity.addComponent("gsplat", { asset })
      // Los modelos de gaussian splatting suelen venir invertidos en Y.
      entity.setLocalEulerAngles(0, 0, 180)
      app?.root.addChild(entity)
      setIsReady(true)
    })

    return () => {
      disposed = true
      resizeObserver.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("wheel", onWheel)
      app?.destroy()
      app = null
      canvas.remove()
      container.innerHTML = ""
    }
  }, [modelUrl, cameraKey])

  return (
    <div
      className={`relative h-150 w-full overflow-hidden rounded-xl border bg-black ${className}`}
    >
      <div ref={containerRef} className="h-full w-full" />

      {previewUrl && !isReady && !error && (
        <img
          src={previewUrl}
          alt="Vista previa del recorrido 3D"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!isReady && !error && (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-sm text-white">
          Cargando recorrido 3D...
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
