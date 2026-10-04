import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

interface MechanicalDial3DProps {
  rotationDegRef: React.MutableRefObject<number>
  activeIdx?: number
  className?: string
}

export default function MechanicalDial3D({
  rotationDegRef,
  activeIdx = 0,
  className = '',
}: MechanicalDial3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<THREE.Object3D | null>(null)
  const assemblyRef = useRef<THREE.Object3D | null>(null)
  const textMeshesRef = useRef<(THREE.Mesh | null)[]>([null, null, null, null])
  const sectorMeshesRef = useRef<(THREE.Mesh | null)[]>([null, null, null, null])
  const mouseRef = useRef({ targetX: 0, targetY: 0, curX: 0, curY: 0 })
  const activeIdxRef = useRef(activeIdx)

  useEffect(() => {
    activeIdxRef.current = activeIdx
  }, [activeIdx])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 540
    const height = container.clientHeight || 540

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene()
    
    // Front-facing perspective camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50)
    camera.position.set(0, 0, 7.5)
    camera.lookAt(0, 0, 0)

    // 2. High-Performance WebGL Renderer with Cinematic Dynamic Range
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05 // Deep moody contrast, no blown-out highlights
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // 3. Realistic Studio Environment Map for Specular Glints (Dark & Moody)
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const roomEnv = new RoomEnvironment()
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture
    scene.environment = envTexture
    scene.environmentIntensity = 0.75

    // 4. Moody, Atmospheric Studio Lighting Rig
    // Low ambient light so shadows stay deep and cinematic
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
    scene.add(ambientLight)

    // Key Light: Cool studio softbox for subtle top knurling & chamfer highlights
    const keyLight = new THREE.DirectionalLight(0xd4e4ff, 2.0)
    keyLight.position.set(2.4, 3.2, 4.0)
    scene.add(keyLight)

    // Apex Focus Spotlight: Directly illuminates the 12 o'clock reticle & active 3D text
    const apexSpot = new THREE.DirectionalLight(0xffffff, 2.4)
    apexSpot.position.set(0, 2.6, 4.6)
    scene.add(apexSpot)

    // Moody Cyan Rim Light: Sharp edge reflections across knurling teeth
    const cyanRim = new THREE.PointLight(0x00f0ff, 4.5, 12, 1.3)
    cyanRim.position.set(-2.8, -2.4, 2.2)
    scene.add(cyanRim)

    // Acid Green Secondary Rim Light: Subtle cinematic edge glint
    const acidRim = new THREE.PointLight(0x7cff3a, 2.0, 10, 1.5)
    acidRim.position.set(2.8, -2.4, 1.8)
    scene.add(acidRim)

    // Very soft front fill to prevent pure pitch-black shadows
    const frontFill = new THREE.DirectionalLight(0x3a4b60, 0.9)
    frontFill.position.set(0, -0.5, 5.5)
    scene.add(frontFill)

    // 5. Load Optimized Mechanical Dial with 3D Text GLB
    const loader = new GLTFLoader()
    loader.load(
      '/models/mechanical_dial.glb',
      (gltf) => {
        const root = gltf.scene

        // Configure PBR materials for moody dark luxury aesthetic
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = false
            mesh.receiveShadow = false

            // Track 3D text meshes for dynamic active glow
            for (let i = 0; i < 4; i++) {
              if (mesh.name === `Rotor_Text_${i}` || mesh.name.includes(`TextCurve_${i}`)) {
                textMeshesRef.current[i] = mesh
              }
              if (mesh.name === `Rotor_Sector_${i}` || mesh.name.includes(`SecCurve_${i}`)) {
                sectorMeshesRef.current[i] = mesh
              }
            }

            if (mesh.material) {
              const originalMat = mesh.material as THREE.MeshStandardMaterial
              const mat = originalMat.clone()

              if (mat.name.includes('CyanLED')) {
                // High-visibility electric cyan luminescent markers
                mat.color = new THREE.Color(0x00f0ff)
                mat.emissive = new THREE.Color(0x00e5ff)
                mat.emissiveIntensity = 5.5
                mat.roughness = 0.10
                mat.metalness = 0.10
                mat.toneMapped = false
              } else if (mat.name.includes('Chrome')) {
                // Polished mirror chrome pointer & rivets
                mat.color = new THREE.Color(0xffffff)
                mat.metalness = 0.98
                mat.roughness = 0.06
                mat.envMapIntensity = 2.4
              } else if (mat.name.includes('Text3D')) {
                // Refined 3D metallic typography
                mat.color = new THREE.Color(0xd4e2f5)
                mat.metalness = 0.88
                mat.roughness = 0.14
                mat.emissive = new THREE.Color(0x00d8ff)
                mat.emissiveIntensity = 0.4
                mat.envMapIntensity = 2.0
              } else if (mat.name.includes('Gunmetal')) {
                // Dark moody machined titanium alloy
                mat.color = new THREE.Color(0x1a212e)
                mat.metalness = 0.76
                mat.roughness = 0.22
                mat.envMapIntensity = 1.6
              } else if (mat.name.includes('Chassis')) {
                // Deep obsidian slate housing
                mat.color = new THREE.Color(0x0c0f16)
                mat.metalness = 0.70
                mat.roughness = 0.45
                mat.envMapIntensity = 1.0
              }
              mesh.material = mat
            }
          }
        })

        // Find Dial_Rotor node
        const rotor = root.getObjectByName('Dial_Rotor')
        if (rotor) {
          rotorRef.current = rotor
        }

        // Find Assembly Root
        const assembly = root.getObjectByName('Dial_Assembly') || root
        assemblyRef.current = assembly

        // Direct forward orientation
        assembly.rotation.set(0, 0, 0)
        assembly.scale.setScalar(1.0)

        scene.add(root)
      },
      undefined,
      (err) => {
        console.warn('Failed to load mechanical dial GLB:', err)
      }
    )

    // 6. Mouse Parallax Pointer Tracking
    const handlePointerMove = (e: PointerEvent) => {
      const { innerWidth, innerHeight } = window
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // 7. 120 FPS Render Loop with Smooth Inertial Scrub
    let animId: number
    let curRotZ = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Smooth mouse damping
      const m = mouseRef.current
      m.curX += (m.targetX - m.curX) * 0.05
      m.curY += (m.targetY - m.curY) * 0.05

      // Subtle mechanical 3D tilt
      if (assemblyRef.current) {
        assemblyRef.current.rotation.x = -m.curY * 0.05
        assemblyRef.current.rotation.y = m.curX * 0.07
      }

      // Synchronize rotor rotation with scroll scrub using mechanical damping
      if (rotorRef.current) {
        const targetRotZ = THREE.MathUtils.degToRad(-rotationDegRef.current)
        curRotZ += (targetRotZ - curRotZ) * 0.14
        rotorRef.current.rotation.z = curRotZ
      }

      // Dynamically highlight active 3D text
      const active = activeIdxRef.current
      for (let i = 0; i < 4; i++) {
        const tMesh = textMeshesRef.current[i]
        const sMesh = sectorMeshesRef.current[i]
        const isCurrent = i === active

        if (tMesh && tMesh.material) {
          const mat = tMesh.material as THREE.MeshStandardMaterial
          const targetEmissive = isCurrent ? 2.0 : 0.2
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.1)
          if (isCurrent) {
            mat.color.lerp(new THREE.Color(0xffffff), 0.1)
            mat.emissive.lerp(new THREE.Color(0x00f0ff), 0.1)
          } else {
            mat.color.lerp(new THREE.Color(0x8a9bb2), 0.1)
            mat.emissive.lerp(new THREE.Color(0x040810), 0.1)
          }
        }

        if (sMesh && sMesh.material) {
          const mat = sMesh.material as THREE.MeshStandardMaterial
          const targetEmissive = isCurrent ? 6.0 : 1.8
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.1)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    animate()

    // 8. Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('pointermove', handlePointerMove)
      ro.disconnect()
      pmremGenerator.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [rotationDegRef])

  return (
    <div
      ref={containerRef}
      className={`aud-3d-canvas-container ${className}`}
      aria-hidden="true"
    />
  )
}
