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
  position: [0, 1.5, 4] as Vec3,
  lookAt: [0, 0, 0] as Vec3,
}

const DEFAULT_CONTROLS = {
  mouseSensitivityX: 0.00075,
  mouseSensitivityY: 0.00045,
  keyboardTurnSpeed: 0.85,
  baseMoveSpeed: 0.75,
  fastMoveMultiplier: 1.8,
  verticalMoveSpeed: 0.45,
  wheelMoveAmount: 0.35,
  rotationDamping: 0.18,
  movementDamping: 0.22,
  minPitch: -0.75,
  maxPitch: 0.65,
}

const MAX_MOUSE_DELTA_X = 35
const MAX_MOUSE_DELTA_Y = 25
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
    pitch: clamp(
      Math.asin(direction[1]),
      DEFAULT_CONTROLS.minPitch,
      DEFAULT_CONTROLS.maxPitch
    ),
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

export function SpaceSogViewer({
  modelUrl,
  previewUrl,
  camera,
  className = "",
}: SpaceSogViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const keyStateRef = useRef<Set<string>>(new Set())
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
  const currentStateRef = useRef<CameraState | null>(null)
  const targetStateRef = useRef<CameraState | null>(null)
  const initialStateRef = useRef<CameraState | null>(null)
  const cameraEntityRef = useRef<pc.Entity | null>(null)
  const appRef = useRef<pc.Application | null>(null)
  const frameTimeRef = useRef<number | null>(null)
  const isKeyboardActiveRef = useRef(false)
  const viewerFocusRef = useRef(false)
  const hideHelpTimeoutRef = useRef<number | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showHelpOverlay, setShowHelpOverlay] = useState(true)

  const cameraKey = useMemo(() => JSON.stringify(camera ?? {}), [camera])

  const resetHelpTimer = () => {
    setShowHelpOverlay(true)

    if (hideHelpTimeoutRef.current) {
      window.clearTimeout(hideHelpTimeoutRef.current)
    }

    hideHelpTimeoutRef.current = window.setTimeout(() => {
      setShowHelpOverlay(false)
    }, HELP_AUTO_HIDE_MS)
  }

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

  const shouldHandleKeyboard = () => isKeyboardActiveRef.current

  const updateCameraEntity = (state: CameraState) => {
    const cameraEntity = cameraEntityRef.current
    if (!cameraEntity) return

    const forward = getForwardVector(state.yaw, state.pitch)
    const lookAt = addVec3(state.position, forward)

    cameraEntity.setPosition(state.position[0], state.position[1], state.position[2])
    cameraEntity.lookAt(lookAt[0], lookAt[1], lookAt[2])
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

  useEffect(() => {
    const container = containerRef.current
    const canvasHost = canvasHostRef.current
    if (!container || !canvasHost || !modelUrl) return

    let disposed = false
    setIsReady(false)
    setError(null)
    setIsFocused(false)
    setShowHelpOverlay(true)
    keyStateRef.current.clear()
    isKeyboardActiveRef.current = false
    viewerFocusRef.current = false

    canvasHost.innerHTML = ""

    const canvas = document.createElement("canvas")
    canvas.style.display = "block"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.touchAction = "none"
    canvasHost.appendChild(canvas)

    let app: pc.Application | null = null

    try {
      app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
        graphicsDeviceOptions: { antialias: true, alpha: false },
      })
    } catch (appError) {
      console.error(appError)
      setError("No se pudo inicializar el visor 3D.")
      return
    }

    appRef.current = app
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

    const cameraEntity = new pc.Entity("camera")
    cameraEntity.addComponent("camera", {
      clearColor: new pc.Color(0, 0, 0, 1),
      fov: 60,
    })
    app.root.addChild(cameraEntity)
    cameraEntityRef.current = cameraEntity

    const initialPosition = camera?.position ?? DEFAULT_CAMERA.position
    const initialLookAt = camera?.lookAt ?? DEFAULT_CAMERA.lookAt
    const initialAngles = getYawPitch(initialPosition, initialLookAt)

    initialStateRef.current = {
      position: [...initialPosition] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }
    currentStateRef.current = {
      position: [...initialPosition] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }
    targetStateRef.current = {
      position: [...initialPosition] as Vec3,
      yaw: initialAngles.yaw,
      pitch: initialAngles.pitch,
    }

    updateCameraEntity(initialStateRef.current)

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
      isKeyboardActiveRef.current = true
      viewerFocusRef.current = true
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
      const safeDeltaY = clamp(deltaY, -MAX_MOUSE_DELTA_Y, MAX_MOUSE_DELTA_Y)

      target.yaw += safeDeltaX * DEFAULT_CONTROLS.mouseSensitivityX
      target.pitch = clamp(
        target.pitch - safeDeltaY * DEFAULT_CONTROLS.mouseSensitivityY,
        DEFAULT_CONTROLS.minPitch,
        DEFAULT_CONTROLS.maxPitch
      )
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerStateRef.current.id === event.pointerId) {
        stopPointerTracking(event.pointerId)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY < 0 ? 1 : -1
      moveTargetForward(direction * DEFAULT_CONTROLS.wheelMoveAmount)
      resetHelpTimer()
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
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
      isKeyboardActiveRef.current = true
      viewerFocusRef.current = true
      setIsFocused(true)
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
            -MAX_MOUSE_DELTA_X,
            MAX_MOUSE_DELTA_X
          )
          const safeDeltaY = clamp(
            currentCenter.y - lastCenter.y,
            -MAX_MOUSE_DELTA_Y,
            MAX_MOUSE_DELTA_Y
          )

          target.yaw += safeDeltaX * DEFAULT_CONTROLS.mouseSensitivityX
          target.pitch = clamp(
            target.pitch - safeDeltaY * DEFAULT_CONTROLS.mouseSensitivityY,
            DEFAULT_CONTROLS.minPitch,
            DEFAULT_CONTROLS.maxPitch
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
          moveTargetForward(
            clamp(pinchDelta * 0.005, -DEFAULT_CONTROLS.wheelMoveAmount, DEFAULT_CONTROLS.wheelMoveAmount)
          )
        }

        if (lastCenter) {
          const safeDeltaX = clamp(
            center.x - lastCenter.x,
            -MAX_MOUSE_DELTA_X,
            MAX_MOUSE_DELTA_X
          )
          const safeDeltaY = clamp(
            center.y - lastCenter.y,
            -MAX_MOUSE_DELTA_Y,
            MAX_MOUSE_DELTA_Y
          )

          target.yaw += safeDeltaX * DEFAULT_CONTROLS.mouseSensitivityX * 0.45
          target.pitch = clamp(
            target.pitch - safeDeltaY * DEFAULT_CONTROLS.mouseSensitivityY * 0.45,
            DEFAULT_CONTROLS.minPitch,
            DEFAULT_CONTROLS.maxPitch
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
        "shift",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "escape",
      ])

      if (blockedKeys.has(key)) {
        event.preventDefault()
      }

      if (key === "escape") {
        keyStateRef.current.clear()
        isKeyboardActiveRef.current = false
        viewerFocusRef.current = false
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
      isKeyboardActiveRef.current = false
      viewerFocusRef.current = false
      setIsFocused(false)
    }

    app.on("update", (deltaTime: number) => {
      if (disposed) return

      const current = currentStateRef.current
      const target = targetStateRef.current
      if (!current || !target) return

      const dt = Math.min(deltaTime, 0.05)
      const pressed = keyStateRef.current
      const speedMultiplier = pressed.has("shift")
        ? DEFAULT_CONTROLS.fastMoveMultiplier
        : 1
      const moveStep = DEFAULT_CONTROLS.baseMoveSpeed * speedMultiplier * dt
      const verticalMoveStep = DEFAULT_CONTROLS.verticalMoveSpeed * speedMultiplier * dt

      const flatForward = normalizeVec3([
        Math.sin(target.yaw),
        0,
        -Math.cos(target.yaw),
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
        target.yaw += DEFAULT_CONTROLS.keyboardTurnSpeed * dt
      }
      if (pressed.has("d")) {
        target.yaw -= DEFAULT_CONTROLS.keyboardTurnSpeed * dt
      }
      if (pressed.has("e") || pressed.has(" ")) {
        movement = addVec3(movement, scaleVec3(worldUp, verticalMoveStep))
      }
      if (pressed.has("q") || pressed.has("control")) {
        movement = subtractVec3(movement, scaleVec3(worldUp, verticalMoveStep))
      }

      if (lengthVec3(movement) > 0.0001) {
        const horizontalMovement: Vec3 = [movement[0], 0, movement[2]]
        let translation: Vec3 = [0, movement[1], 0]

        if (lengthVec3(horizontalMovement) > 0.0001) {
          translation = addVec3(
            translation,
            scaleVec3(normalizeVec3(horizontalMovement), moveStep)
          )
        }

        target.position = addVec3(target.position, translation)
      }

      current.yaw = lerp(
        current.yaw,
        target.yaw,
        DEFAULT_CONTROLS.rotationDamping
      )
      current.pitch = lerp(
        current.pitch,
        target.pitch,
        DEFAULT_CONTROLS.rotationDamping
      )
      current.position = lerpVec3(
        current.position,
        target.position,
        DEFAULT_CONTROLS.movementDamping
      )

      updateCameraEntity(current)

      const settled =
        almostEqual(current.yaw, target.yaw) &&
        almostEqual(current.pitch, target.pitch) &&
        almostEqualVec3(current.position, target.position)

      if (settled) {
        current.yaw = target.yaw
        current.pitch = target.pitch
        current.position = [...target.position] as Vec3
      }
    })

    app.start()

    canvas.addEventListener("contextmenu", handleContextMenu)
    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    canvas.addEventListener("pointercancel", handlePointerUp)
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("keyup", handleKeyUp, true)
    window.addEventListener("blur", handleWindowBlur)

    resetHelpTimer()

    app.assets.loadFromUrl(modelUrl, "gsplat", (loadError, asset) => {
      if (disposed) return
      if (loadError || !asset) {
        console.error("Error cargando .sog:", loadError)
        setError("No se pudo cargar el modelo 3D (.sog).")
        return
      }

      const entity = new pc.Entity("sog-model")
      entity.addComponent("gsplat", { asset })
      entity.setLocalEulerAngles(0, 0, 180)
      app?.root.addChild(entity)
      setIsReady(true)
    })

    return () => {
      disposed = true

      if (hideHelpTimeoutRef.current) {
        window.clearTimeout(hideHelpTimeoutRef.current)
        hideHelpTimeoutRef.current = null
      }

      resizeObserver.disconnect()
      keyStateRef.current.clear()
      isKeyboardActiveRef.current = false
      viewerFocusRef.current = false
      stopPointerTracking()

      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("keyup", handleKeyUp, true)
      window.removeEventListener("blur", handleWindowBlur)
      canvas.removeEventListener("contextmenu", handleContextMenu)
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
      canvas.removeEventListener("pointercancel", handlePointerUp)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchcancel", handleTouchEnd)

      app.destroy()
      appRef.current = null
      cameraEntityRef.current = null
      currentStateRef.current = null
      targetStateRef.current = null
      initialStateRef.current = null
      canvas.remove()
      canvasHost.innerHTML = ""
    }
  }, [modelUrl, cameraKey, camera])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onPointerDownCapture={() => {
        containerRef.current?.focus()
        isKeyboardActiveRef.current = true
        viewerFocusRef.current = true
        setIsFocused(true)
      }}
      onClickCapture={() => {
        containerRef.current?.focus()
        isKeyboardActiveRef.current = true
        viewerFocusRef.current = true
        setIsFocused(true)
      }}
      onBlur={() => {
        viewerFocusRef.current = false
        keyStateRef.current.clear()
        setIsFocused(false)
      }}
      className={`relative h-150 w-full overflow-hidden rounded-xl border bg-black outline-none ${className}`}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />

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

      {showHelpOverlay && !error && (
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-[90%] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-xs text-white/90 backdrop-blur-md">
          Click para activar · Arrastra suave para mirar · W/S avanzar · A/D girar
        </div>
      )}

      {!error && !isFocused && (
        <div className="pointer-events-none absolute top-4 left-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
          Click en el visor para activar controles
        </div>
      )}

      {!error && isFocused && (
        <div className="pointer-events-none absolute top-4 left-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-100 backdrop-blur-md">
          Controles activos
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
