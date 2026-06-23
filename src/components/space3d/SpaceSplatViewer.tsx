import * as SPLAT from "gsplat"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

type Vec3 = [number, number, number]

type SpaceSplatViewerProps = {
  modelUrl: string
  previewUrl?: string
  camera?: {
    position?: Vec3
    lookAt?: Vec3
  }
  className?: string
  showControls?: boolean
  controlOptions?: {
    damping?: number
    movementDamping?: number
    mouseSensitivityX?: number
    mouseSensitivityY?: number
    baseMoveSpeed?: number
    fastMoveMultiplier?: number
    keyboardTurnSpeed?: number
  }
}

type CameraState = {
  position: Vec3
  yaw: number
  pitch: number
}

type TouchState = {
  active: boolean
  lastCenter: { x: number; y: number } | null
  lastDistance: number | null
}

const DEFAULT_CAMERA = {
  position: [0, 1.2, 6] as Vec3,
  lookAt: [0, 0, 0] as Vec3,
}

const DEFAULT_CONTROLS = {
  damping: 0.12,
  movementDamping: 0.18,
  mouseSensitivityX: 0.0018,
  mouseSensitivityY: 0.0011,
  baseMoveSpeed: 1.8,
  fastMoveMultiplier: 2.5,
  keyboardTurnSpeed: 2.2,
}

const MIN_PITCH = -1.25
const MAX_PITCH = 1.25
const MAX_MOUSE_DELTA = 80
const WHEEL_STEP = 0.65
const HELP_AUTO_HIDE_MS = 4500

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function addVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function subtractVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function scaleVec3(v: Vec3, scalar: number): Vec3 {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar]
}

function lengthVec3(v: Vec3) {
  return Math.hypot(v[0], v[1], v[2])
}

function normalizeVec3(v: Vec3): Vec3 {
  const len = lengthVec3(v) || 1
  return [v[0] / len, v[1] / len, v[2] / len]
}

function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function lerp(current: number, target: number, damping: number) {
  return current + (target - current) * damping
}

function lerpVec3(current: Vec3, target: Vec3, damping: number): Vec3 {
  return [
    lerp(current[0], target[0], damping),
    lerp(current[1], target[1], damping),
    lerp(current[2], target[2], damping),
  ]
}

function getYawPitch(position: Vec3, lookAt: Vec3) {
  const direction = normalizeVec3(subtractVec3(lookAt, position))
  return {
    yaw: Math.atan2(direction[0], -direction[2]),
    pitch: clamp(Math.asin(direction[1]), MIN_PITCH, MAX_PITCH),
  }
}

function getForwardVector(yaw: number, pitch: number): Vec3 {
  const cosPitch = Math.cos(pitch)
  return normalizeVec3([
    Math.sin(yaw) * cosPitch,
    Math.sin(pitch),
    -Math.cos(yaw) * cosPitch,
  ])
}

function almostEqual(a: number, b: number, epsilon = 0.0001) {
  return Math.abs(a - b) <= epsilon
}

function almostEqualVec3(a: Vec3, b: Vec3, epsilon = 0.0001) {
  return (
    almostEqual(a[0], b[0], epsilon) &&
    almostEqual(a[1], b[1], epsilon) &&
    almostEqual(a[2], b[2], epsilon)
  )
}

export function SpaceSplatViewer({
  modelUrl,
  previewUrl,
  camera,
  className = "",
  showControls = true,
  controlOptions,
}: SpaceSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const rendererRef = useRef<SPLAT.WebGLRenderer | null>(null)
  const splatCameraRef = useRef<SPLAT.Camera | null>(null)
  const currentStateRef = useRef<CameraState | null>(null)
  const targetStateRef = useRef<CameraState | null>(null)
  const initialStateRef = useRef<CameraState | null>(null)
  const keyStateRef = useRef<Set<string>>(new Set())
  const viewerFocusRef = useRef(false)
  const viewerHoverRef = useRef(false)
  const isKeyboardActiveRef = useRef(false)
  const pointerStateRef = useRef<{
    id: number | null
    dragging: boolean
    lastX: number
    lastY: number
  }>({
    id: null,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })
  const touchStateRef = useRef<TouchState>({
    active: false,
    lastCenter: null,
    lastDistance: null,
  })
  const lastFrameTimeRef = useRef<number | null>(null)
  const hideHelpTimeoutRef = useRef<number | null>(null)

  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelpOverlay, setShowHelpOverlay] = useState(true)
  const [isFocused, setIsFocused] = useState(false)

  const isMobile = useIsMobile()

  const resolvedCamera = useMemo(
    () => ({
      position: camera?.position ?? DEFAULT_CAMERA.position,
      lookAt: camera?.lookAt ?? DEFAULT_CAMERA.lookAt,
    }),
    [camera]
  )

  const resolvedControls = useMemo(
    () => ({
      damping: controlOptions?.damping ?? DEFAULT_CONTROLS.damping,
      movementDamping:
        controlOptions?.movementDamping ?? DEFAULT_CONTROLS.movementDamping,
      mouseSensitivityX:
        controlOptions?.mouseSensitivityX ?? DEFAULT_CONTROLS.mouseSensitivityX,
      mouseSensitivityY:
        controlOptions?.mouseSensitivityY ?? DEFAULT_CONTROLS.mouseSensitivityY,
      baseMoveSpeed:
        controlOptions?.baseMoveSpeed ?? DEFAULT_CONTROLS.baseMoveSpeed,
      fastMoveMultiplier:
        controlOptions?.fastMoveMultiplier ??
        DEFAULT_CONTROLS.fastMoveMultiplier,
      keyboardTurnSpeed:
        controlOptions?.keyboardTurnSpeed ??
        DEFAULT_CONTROLS.keyboardTurnSpeed,
    }),
    [controlOptions]
  )

  const cameraKey = useMemo(
    () => JSON.stringify(resolvedCamera),
    [resolvedCamera]
  )

  const normalizeKey = (event: KeyboardEvent) => {
    const code = event.code.toLowerCase()

    if (code === "keyw") return "w"
    if (code === "keya") return "a"
    if (code === "keys") return "s"
    if (code === "keyd") return "d"
    if (code === "keyq") return "q"
    if (code === "keye") return "e"
    if (code === "space") return " "
    if (code === "shiftleft" || code === "shiftright") return "shift"
    if (code === "controlleft" || code === "controlright") return "control"
    if (code === "escape") return "escape"

    return event.key.toLowerCase()
  }

  const resetHelpTimer = () => {
    setShowHelpOverlay(true)

    if (hideHelpTimeoutRef.current) {
      window.clearTimeout(hideHelpTimeoutRef.current)
    }

    hideHelpTimeoutRef.current = window.setTimeout(() => {
      setShowHelpOverlay(false)
    }, HELP_AUTO_HIDE_MS)
  }

  const updateCameraFromState = (state: CameraState) => {
    const splatCamera = splatCameraRef.current
    if (!splatCamera) return

    const forward = getForwardVector(state.yaw, state.pitch)

    splatCamera.position = new SPLAT.Vector3(
      state.position[0],
      state.position[1],
      state.position[2]
    )
    splatCamera.rotation = SPLAT.Quaternion.LookRotation(
      new SPLAT.Vector3(forward[0], forward[1], forward[2])
    )
    splatCamera.update()
  }

  const moveTargetForward = (distance: number) => {
    const target = targetStateRef.current
    if (!target) return

    const forward = getForwardVector(target.yaw, target.pitch)
    target.position = addVec3(target.position, scaleVec3(forward, distance))
  }

  const resetView = () => {
    const initial = initialStateRef.current
    const target = targetStateRef.current
    if (!initial || !target) return

    target.position = [...initial.position] as Vec3
    target.yaw = initial.yaw
    target.pitch = initial.pitch
    resetHelpTimer()
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (container.requestFullscreen) {
        await container.requestFullscreen()
      }
    } catch (fullscreenError) {
      console.error(fullscreenError)
    }
  }

  useEffect(() => {
    if (!containerRef.current || !canvasHostRef.current || !modelUrl) return

    let disposed = false

    setProgress(0)
    setIsReady(false)
    setError(null)
    setIsFullscreen(document.fullscreenElement === containerRef.current)
    setShowHelpOverlay(true)
    setIsFocused(false)
    isKeyboardActiveRef.current = false

    const container = containerRef.current
    const canvasHost = canvasHostRef.current

    const canvas = document.createElement("canvas")
    canvas.style.display = "block"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.margin = "0"
    canvas.style.padding = "0"
    canvas.style.touchAction = "none"

    canvasHost.innerHTML = ""
    canvasHost.appendChild(canvas)

    const scene = new SPLAT.Scene()
    const splatCamera = new SPLAT.Camera()
    const renderer = new SPLAT.WebGLRenderer(canvas)

    rendererRef.current = renderer
    splatCameraRef.current = splatCamera

    const initialAngles = getYawPitch(
      resolvedCamera.position,
      resolvedCamera.lookAt
    )

    initialStateRef.current = {
      position: [...resolvedCamera.position] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }
    currentStateRef.current = {
      position: [...resolvedCamera.position] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }
    targetStateRef.current = {
      position: [...resolvedCamera.position] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }

    updateCameraFromState(initialStateRef.current)

    const handleResize = () => {
      renderer.resize()
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === container)
      renderer.resize()
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const shouldHandleKeyboard = () => isKeyboardActiveRef.current

    const stopPointerTracking = (pointerId?: number) => {
      if (typeof pointerId === "number" && canvas.hasPointerCapture(pointerId)) {
        canvas.releasePointerCapture(pointerId)
      }

      pointerStateRef.current.id = null
      pointerStateRef.current.dragging = false
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (touchStateRef.current.active) return
      if (event.button !== 0) return

      container.focus()
      viewerFocusRef.current = true
      isKeyboardActiveRef.current = true
      setIsFocused(true)

      pointerStateRef.current.id = event.pointerId
      pointerStateRef.current.dragging = true
      pointerStateRef.current.lastX = event.clientX
      pointerStateRef.current.lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      resetHelpTimer()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerStateRef.current.dragging || pointerStateRef.current.id !== event.pointerId) {
        return
      }

      const target = targetStateRef.current
      if (!target) return

      const deltaX = event.clientX - pointerStateRef.current.lastX
      const deltaY = event.clientY - pointerStateRef.current.lastY

      pointerStateRef.current.lastX = event.clientX
      pointerStateRef.current.lastY = event.clientY

      const safeDeltaX = clamp(deltaX, -MAX_MOUSE_DELTA, MAX_MOUSE_DELTA)
      const safeDeltaY = clamp(deltaY, -MAX_MOUSE_DELTA, MAX_MOUSE_DELTA)

      target.yaw += safeDeltaX * resolvedControls.mouseSensitivityX
      // Y controla la inclinacion vertical y usa menor sensibilidad para sentirse mas estable.
      target.pitch = clamp(
        target.pitch - safeDeltaY * resolvedControls.mouseSensitivityY,
        MIN_PITCH,
        MAX_PITCH
      )
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerStateRef.current.id === event.pointerId) {
        stopPointerTracking(event.pointerId)
      }
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerStateRef.current.id === event.pointerId) {
        stopPointerTracking(event.pointerId)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY < 0 ? 1 : -1
      moveTargetForward(direction * WHEEL_STEP)
      resetHelpTimer()
    }

    const getTouchesData = (touches: TouchList) => {
      const first = touches[0]
      const second = touches[1]
      const center = {
        x: (first.clientX + second.clientX) / 2,
        y: (first.clientY + second.clientY) / 2,
      }
      const distance = Math.hypot(
        second.clientX - first.clientX,
        second.clientY - first.clientY
      )

      return { center, distance }
    }

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      touchStateRef.current.active = true
      resetHelpTimer()

      if (event.touches.length === 1) {
        touchStateRef.current.lastCenter = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
        touchStateRef.current.lastDistance = null
      } else if (event.touches.length >= 2) {
        const { center, distance } = getTouchesData(event.touches)
        touchStateRef.current.lastCenter = center
        touchStateRef.current.lastDistance = distance
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()

      const target = targetStateRef.current
      if (!target) return

      if (event.touches.length === 1) {
        const touch = event.touches[0]
        const currentCenter = { x: touch.clientX, y: touch.clientY }
        const lastCenter = touchStateRef.current.lastCenter

        if (lastCenter) {
          const safeDeltaX = clamp(
            currentCenter.x - lastCenter.x,
            -MAX_MOUSE_DELTA,
            MAX_MOUSE_DELTA
          )
          const safeDeltaY = clamp(
            currentCenter.y - lastCenter.y,
            -MAX_MOUSE_DELTA,
            MAX_MOUSE_DELTA
          )

          target.yaw += safeDeltaX * resolvedControls.mouseSensitivityX
          target.pitch = clamp(
            target.pitch - safeDeltaY * resolvedControls.mouseSensitivityY,
            MIN_PITCH,
            MAX_PITCH
          )
        }

        touchStateRef.current.lastCenter = currentCenter
        touchStateRef.current.lastDistance = null
      } else if (event.touches.length >= 2) {
        const { center, distance } = getTouchesData(event.touches)
        const lastCenter = touchStateRef.current.lastCenter
        const lastDistance = touchStateRef.current.lastDistance

        if (lastDistance && lastDistance > 0) {
          const pinchDelta = distance - lastDistance
          moveTargetForward(pinchDelta * 0.01)
        }

        if (lastCenter) {
          const safeDeltaX = clamp(center.x - lastCenter.x, -MAX_MOUSE_DELTA, MAX_MOUSE_DELTA)
          const safeDeltaY = clamp(center.y - lastCenter.y, -MAX_MOUSE_DELTA, MAX_MOUSE_DELTA)

          target.yaw += safeDeltaX * resolvedControls.mouseSensitivityX * 0.45
          target.pitch = clamp(
            target.pitch - safeDeltaY * resolvedControls.mouseSensitivityY * 0.45,
            MIN_PITCH,
            MAX_PITCH
          )
        }

        touchStateRef.current.lastCenter = center
        touchStateRef.current.lastDistance = distance
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()

      if (event.touches.length === 0) {
        touchStateRef.current.active = false
        touchStateRef.current.lastCenter = null
        touchStateRef.current.lastDistance = null
      } else if (event.touches.length === 1) {
        touchStateRef.current.lastCenter = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
        touchStateRef.current.lastDistance = null
      } else {
        const { center, distance } = getTouchesData(event.touches)
        touchStateRef.current.lastCenter = center
        touchStateRef.current.lastDistance = distance
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleKeyboard()) return

      const key = normalizeKey(event)
      const blockedKeys = new Set([
        "w",
        "a",
        "s",
        "d",
        "q",
        "e",
        " ",
        "control",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "shift",
        "escape",
      ])

      if (blockedKeys.has(key)) {
        event.preventDefault()
      }

      if (key === "escape") {
        keyStateRef.current.clear()
        viewerFocusRef.current = false
        isKeyboardActiveRef.current = false
        setIsFocused(false)
        return
      }

      keyStateRef.current.add(key)
      resetHelpTimer()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keyStateRef.current.delete(normalizeKey(event))
    }

    const handleWindowBlur = () => {
      keyStateRef.current.clear()
      viewerFocusRef.current = false
      isKeyboardActiveRef.current = false
      setIsFocused(false)
    }

    window.addEventListener("resize", handleResize)
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("keyup", handleKeyUp, true)
    window.addEventListener("blur", handleWindowBlur)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    canvas.addEventListener("contextmenu", handleContextMenu)
    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    canvas.addEventListener("pointercancel", handlePointerCancel)
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    resetHelpTimer()

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

        const frame = (time: number) => {
          if (disposed) return

          const current = currentStateRef.current
          const target = targetStateRef.current

          if (current && target) {
            const lastTime = lastFrameTimeRef.current ?? time
            const deltaTime = Math.min((time - lastTime) / 1000, 0.05)
            lastFrameTimeRef.current = time

            const pressed = keyStateRef.current
            const speedMultiplier = pressed.has("shift")
              ? resolvedControls.fastMoveMultiplier
              : 1
            const moveStep =
              resolvedControls.baseMoveSpeed * speedMultiplier * deltaTime

            const targetForward = getForwardVector(target.yaw, target.pitch)
            const flatForward = normalizeVec3([
              targetForward[0],
              0,
              targetForward[2],
            ])
            // Vector derecho plano (flatForward × up) para el strafe lateral.
            const flatRight = normalizeVec3([
              Math.cos(target.yaw),
              0,
              Math.sin(target.yaw),
            ])
            const worldUp: Vec3 = [0, 1, 0]
            let movement: Vec3 = [0, 0, 0]

            if (pressed.has("w")) {
              movement = addVec3(movement, flatForward)
            }
            if (pressed.has("s")) {
              movement = subtractVec3(movement, flatForward)
            }
            if (pressed.has("a")) {
              movement = subtractVec3(movement, flatRight)
            }
            if (pressed.has("d")) {
              movement = addVec3(movement, flatRight)
            }
            // Giro opcional con flechas izquierda/derecha.
            if (pressed.has("arrowleft")) {
              target.yaw += resolvedControls.keyboardTurnSpeed * deltaTime
            }
            if (pressed.has("arrowright")) {
              target.yaw -= resolvedControls.keyboardTurnSpeed * deltaTime
            }
            if (pressed.has("e") || pressed.has(" ")) {
              movement = addVec3(movement, worldUp)
            }
            if (pressed.has("q") || pressed.has("control")) {
              movement = subtractVec3(movement, worldUp)
            }

            if (lengthVec3(movement) > 0.0001) {
              const normalizedMovement = normalizeVec3(movement)
              target.position = addVec3(
                target.position,
                scaleVec3(normalizedMovement, moveStep)
              )
            }

            current.yaw = lerp(current.yaw, target.yaw, resolvedControls.damping)
            current.pitch = lerp(
              current.pitch,
              target.pitch,
              resolvedControls.damping
            )
            current.position = lerpVec3(
              current.position,
              target.position,
              resolvedControls.movementDamping
            )

            updateCameraFromState(current)

            const settled =
              almostEqual(current.yaw, target.yaw) &&
              almostEqual(current.pitch, target.pitch) &&
              almostEqualVec3(current.position, target.position)

            if (settled) {
              current.yaw = target.yaw
              current.pitch = target.pitch
              current.position = [...target.position] as Vec3
            }
          }

          renderer.resize()
          renderer.render(scene, splatCamera)
          frameRef.current = requestAnimationFrame(frame)
        }

        frameRef.current = requestAnimationFrame(frame)
      } catch (loadError) {
        console.error(loadError)
        setError("No se pudo cargar el modelo 3D.")
      }
    }

    loadModel()

    return () => {
      disposed = true

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }

      if (hideHelpTimeoutRef.current) {
        window.clearTimeout(hideHelpTimeoutRef.current)
        hideHelpTimeoutRef.current = null
      }

      stopPointerTracking()
      keyStateRef.current.clear()
      viewerFocusRef.current = false
      viewerHoverRef.current = false
      isKeyboardActiveRef.current = false
      lastFrameTimeRef.current = null

      window.removeEventListener("resize", handleResize)
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("keyup", handleKeyUp, true)
      window.removeEventListener("blur", handleWindowBlur)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      canvas.removeEventListener("contextmenu", handleContextMenu)
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
      canvas.removeEventListener("pointercancel", handlePointerCancel)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchcancel", handleTouchEnd)

      renderer.dispose()
      rendererRef.current = null
      splatCameraRef.current = null
      currentStateRef.current = null
      targetStateRef.current = null
      initialStateRef.current = null

      canvas.remove()
      canvasHost.innerHTML = ""
    }
  }, [modelUrl, cameraKey, resolvedControls])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={() => {
        viewerHoverRef.current = true
      }}
      onMouseLeave={() => {
        viewerHoverRef.current = false
      }}
      onFocus={() => {
        viewerFocusRef.current = true
        setIsFocused(true)
        resetHelpTimer()
      }}
      onBlur={() => {
        viewerFocusRef.current = false
        keyStateRef.current.clear()
        setIsFocused(false)
      }}
      onPointerDownCapture={() => {
        containerRef.current?.focus()
        viewerFocusRef.current = true
        isKeyboardActiveRef.current = true
        setIsFocused(true)
      }}
      onClickCapture={() => {
        containerRef.current?.focus()
        viewerFocusRef.current = true
        isKeyboardActiveRef.current = true
        setIsFocused(true)
      }}
      className={`relative h-150 w-full overflow-hidden rounded-xl border bg-black outline-none ${className}`}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />

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

      {showControls && !error && (
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute top-4 right-4 flex flex-col gap-2 rounded-2xl border border-white/15 bg-black/35 p-2 backdrop-blur-md">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-start bg-white/10 text-white hover:bg-white/20 dark:bg-black/30"
              onClick={resetView}
            >
              Reiniciar vista
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-white/10 text-white hover:bg-white/20 dark:bg-black/30"
              onClick={() => moveTargetForward(WHEEL_STEP)}
              aria-label="Acercar"
            >
              +
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-white/10 text-white hover:bg-white/20 dark:bg-black/30"
              onClick={() => moveTargetForward(-WHEEL_STEP)}
              aria-label="Alejar"
            >
              -
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-start bg-white/10 text-white hover:bg-white/20 dark:bg-black/30"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-start bg-white/10 text-white hover:bg-white/20 dark:bg-black/30"
              onClick={() => {
                setShowHelpOverlay((current) => !current)
                resetHelpTimer()
              }}
            >
              Ayuda
            </Button>
          </div>

          {showHelpOverlay && (
            <div className="pointer-events-none absolute bottom-4 left-4 max-w-[90%] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-xs text-white/90 backdrop-blur-md">
              {isMobile
                ? "Un dedo mira · Pellizca para acercar"
                : "Click para activar · Mouse para mirar · W/A/S/D moverse · Q/E subir/bajar · Shift correr"}
            </div>
          )}

          {!isMobile && !isFocused && (
            <div className="pointer-events-none absolute top-4 left-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
              Click en el visor para usar WASD
            </div>
          )}

          {!isMobile && isFocused && (
            <div className="pointer-events-none absolute top-4 left-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-100 backdrop-blur-md">
              Controles activos
            </div>
          )}

          {keyStateRef.current.size > 0 && (
            <div className="pointer-events-none absolute top-16 left-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-2 text-[11px] text-white/85 backdrop-blur-md">
              Teclas: {Array.from(keyStateRef.current).join(" ").toUpperCase()}
            </div>
          )}
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
