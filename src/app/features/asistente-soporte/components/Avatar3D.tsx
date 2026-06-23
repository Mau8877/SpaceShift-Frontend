import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { ARKIT_MAPPING, ARKIT_MUSCLES } from "../lib/visemeMapping"
import type { LipSyncCue } from "../types"

interface Avatar3DProps {
  avatarPath: string
  /** Elemento de audio en reproducción (para sincronizar la boca). */
  audioEl: HTMLAudioElement | null
  /** Cues de lip-sync del audio actual. */
  lipSyncData: LipSyncCue[] | null
}

/**
 * Render 3D del avatar con lip-sync. Port imperativo (three.js) del
 * avatar.component.ts de Organiflow. Es client-only: solo se monta vía lazy
 * dentro del widget envuelto en <ClientOnly>, por lo que `window`/WebGL existen.
 */
export function Avatar3D({ avatarPath, audioEl, lipSyncData }: Avatar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Refs para que el loop de animación lea siempre el valor actual sin recrearse.
  const audioRef = useRef<HTMLAudioElement | null>(audioEl)
  const lipSyncRef = useRef<LipSyncCue[] | null>(lipSyncData)
  audioRef.current = audioEl
  lipSyncRef.current = lipSyncData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer / escena / cámara / luces ─────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    // Supersampling: forzar al menos 2x aunque la pantalla sea 1x (cap 3 por
    // rendimiento) para que la cara no se vea borrosa en el canvas pequeño.
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 2), 3))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

    const resize = () => {
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      35,
      (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
      0.1,
      100,
    )
    camera.position.set(0, 0.3, 1.8)
    camera.lookAt(0, 0.2, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 1.2)
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.5)
    dir1.position.set(2, 2, 5)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5)
    dir2.position.set(-2, 0, 2)
    scene.add(ambient, dir1, dir2)

    resize()
    window.addEventListener("resize", resize)

    // ── Carga del modelo + animación idle ──────────────────────────────────
    let mixer: THREE.AnimationMixer | undefined
    let headNode: THREE.Mesh | undefined
    const targetInfluences: Record<string, number> = {}

    const gltfLoader = new GLTFLoader()
    gltfLoader.load(avatarPath, (gltf) => {
      const root = gltf.scene
      root.position.set(-0.6, -2.4, -0.5)
      root.scale.setScalar(1.45)

      root.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh) {
          mesh.frustumCulled = false
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial
            mat.metalness = 0.1
            mat.roughness = 0.7
            // Filtrado anisotrópico → texturas más nítidas en ángulo.
            if (mat.map) {
              mat.map.anisotropy = maxAnisotropy
              mat.map.needsUpdate = true
            }
          }
          if (child.name.toLowerCase().includes("cornea")) child.visible = false
          if (child.name === "Streamoji_Head") headNode = mesh
        }
      })

      scene.add(root)
      mixer = new THREE.AnimationMixer(root)

      const fbxLoader = new FBXLoader()
      fbxLoader.load("/assets/animacion.fbx", (fbx) => {
        if (fbx.animations[0]) {
          fbx.animations[0].name = "Idle"
          const action = mixer!.clipAction(fbx.animations[0], root)
          action.reset().fadeIn(0.5).play()
        }
      })
    })

    // ── Loop de animación + lip-sync ───────────────────────────────────────
    const clock = new THREE.Clock()
    let animId = 0
    let nextBlink = 0
    let blinkEndTime = 0

    const applyLipSync = (delta: number) => {
      if (!headNode?.morphTargetDictionary || !headNode?.morphTargetInfluences)
        return

      ARKIT_MUSCLES.forEach((m) => (targetInfluences[m] = 0))

      const audio = audioRef.current
      const cues = lipSyncRef.current
      if (audio && cues && !audio.paused) {
        const t = audio.currentTime
        const cue = cues.find((c) => t >= c.start && t <= c.end)
        const poses = ARKIT_MAPPING[cue?.value ?? "X"] ?? ARKIT_MAPPING["X"]
        Object.entries(poses).forEach(([m, v]) => (targetInfluences[m] = v!))
      }

      // Parpadeo aleatorio cada 2–6s durante 0.15s.
      const elapsed = clock.elapsedTime
      if (elapsed > nextBlink) {
        blinkEndTime = elapsed + 0.15
        nextBlink = elapsed + THREE.MathUtils.randFloat(2, 6)
      }
      if (elapsed < blinkEndTime) {
        targetInfluences["eyeBlinkLeft"] = 1
        targetInfluences["eyeBlinkRight"] = 1
      }

      const lerpSpeed = 15
      ARKIT_MUSCLES.forEach((muscle) => {
        const idx = headNode!.morphTargetDictionary![muscle]
        if (idx !== undefined) {
          const curr = headNode!.morphTargetInfluences![idx]
          const target = targetInfluences[muscle] ?? 0
          headNode!.morphTargetInfluences![idx] = THREE.MathUtils.lerp(
            curr,
            target,
            delta * lerpSpeed,
          )
        }
      })
    }

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      mixer?.update(delta)
      applyLipSync(delta)
      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      mixer?.stopAllAction()
      renderer.dispose()
    }
  }, [avatarPath])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}

export default Avatar3D
