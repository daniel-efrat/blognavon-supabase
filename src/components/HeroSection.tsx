"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { LazyMotion, domAnimation, m } from "framer-motion"

const HeroSection = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)

  useEffect(() => {
    // [Previous Three.js setup code remains unchanged]
    const currentMount = mountRef.current
    if (typeof window === "undefined" || !currentMount) {
      return
    }

    let animationFrameId: number | null = null

    // --- Basic Scene Setup ---
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    )
    cameraRef.current = camera

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 2.5
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    currentMount.appendChild(renderer.domElement)

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 4.0)
    mainLight.position.set(5, 5, 5)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x6366f1, 3.0)
    fillLight.position.set(-5, 0, -5)
    scene.add(fillLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 2.5)
    topLight.position.set(0, 10, 0)
    scene.add(topLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 2.0)
    backLight.position.set(0, 0, -10)
    scene.add(backLight)

// --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.8
    // Disable controls on mobile
    if (window.innerWidth < 768) {
      controls.enabled = false;
      controls.autoRotate = true;
    }
    controlsRef.current = controls

    // --- Camera Fitting Function ---
    const fitCameraToModel = (
      camera: THREE.PerspectiveCamera,
      controls: OrbitControls,
      object: THREE.Object3D,
      buffer = 1.4
    ) => {
      if (!object) return

      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      controls.target.copy(center)

      const fov = camera.fov * (Math.PI / 180)
      const aspectRatio = camera.aspect

      const distanceY = size.y / (2 * Math.tan(fov / 2))
      const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspectRatio)
      const distanceX = size.x / (2 * Math.tan(horizontalFov / 2))
      const distance = Math.max(distanceY, distanceX)
      const newCameraZ = center.z + distance * buffer

      camera.position.set(center.x, center.y - 2, newCameraZ)
      controls.update()
    }

    const handleResize = () => {
      if (
        !currentMount ||
        currentMount.clientWidth === 0 ||
        currentMount.clientHeight === 0
      ) {
        return
      }

      const width = currentMount.clientWidth
      const height = currentMount.clientHeight

      if (cameraRef.current) {
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
      }

      if (rendererRef.current) {
        rendererRef.current.setSize(width, height)
        rendererRef.current.setPixelRatio(window.devicePixelRatio)
      }

      if (cameraRef.current && controlsRef.current && modelRef.current) {
        fitCameraToModel(
          cameraRef.current,
          controlsRef.current,
          modelRef.current,
          1.6
        )
      }
    }

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    )

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (controlsRef.current) controlsRef.current.update()
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    const startAnimation = () => {
      if (!animationFrameId) {
        animate()
      }
    }

  loader.load(
      "/logo3.gltf",
      (gltf: { scene: THREE.Object3D }) => {
        const model = gltf.scene
        modelRef.current = model

        let meshCount = 0
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            meshCount++

            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: THREE.Material) => mat.dispose())
              } else {
                child.material.dispose()
              }
            }
            if (child.geometry) child.geometry.dispose()

            let envMap
            if (rendererRef.current) {
              const pmremGenerator = new THREE.PMREMGenerator(
                rendererRef.current
              )
              const envScene = new THREE.Scene()
              envMap = pmremGenerator.fromScene(envScene).texture
              pmremGenerator.dispose()
            }

            const material = new THREE.MeshStandardMaterial({
              color: meshCount === 2 ? 0xfb8524 : 0x06b8b7,
              metalness: 0.8,
              roughness: 0,
              envMapIntensity: 1.0,
            })

            if (envMap) {
              material.envMap = envMap
            }

            child.material = material
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        if (sceneRef.current) {
          sceneRef.current.add(model)
        }

        const currentModelBox = new THREE.Box3().setFromObject(model)
        const currentModelCenter = currentModelBox.getCenter(
          new THREE.Vector3()
        )
        if (controlsRef.current) {
          controlsRef.current.target.copy(currentModelCenter)
        }

        if (cameraRef.current && controlsRef.current && modelRef.current) {
          fitCameraToModel(
            cameraRef.current,
            controlsRef.current,
            modelRef.current,
            2.5
          )
        }

        startAnimation()
        handleResize()
      },
      () => {},
      () => {
        const geometry = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshStandardMaterial({
          color: 0x6366f1,
          metalness: 0.5,
          roughness: 0.2,
        })
        const cube = new THREE.Mesh(geometry, material)
        modelRef.current = cube

        const box = new THREE.Box3().setFromObject(cube)
        const center = box.getCenter(new THREE.Vector3())
        cube.position.sub(center)

        if (sceneRef.current) {
          sceneRef.current.add(cube)
        }

        if (controlsRef.current) {
          const cubeCenter = new THREE.Vector3()
          new THREE.Box3().setFromObject(cube).getCenter(cubeCenter)
          controlsRef.current.target.copy(cubeCenter)
        }

        if (cameraRef.current && controlsRef.current && modelRef.current) {
          fitCameraToModel(
            cameraRef.current,
            controlsRef.current,
            modelRef.current,
            1.6
          )
        }

        startAnimation()
        handleResize()
      }
    )

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener("resize", handleResize)

      if (sceneRef.current) {
        sceneRef.current.traverse((object: THREE.Object3D) => {
          if ((object as THREE.Mesh).geometry) {
            ;(object as THREE.Mesh).geometry.dispose()
          }
          if ((object as THREE.Mesh).material) {
            if (Array.isArray((object as THREE.Mesh).material)) {
              ;((object as THREE.Mesh).material as THREE.Material[]).forEach(
                (material) => material.dispose()
              )
            } else {
              ;((object as THREE.Mesh).material as THREE.Material).dispose()
            }
            if ((object as THREE.Mesh).material instanceof THREE.Material) {
              // Cast to MeshStandardMaterial to access texture properties
              const material = (object as THREE.Mesh).material as THREE.MeshStandardMaterial;
              if (material && typeof material.dispose === 'function') {
                material.dispose();
                // Dispose of textures
                material.map?.dispose();
                material.lightMap?.dispose();
                material.aoMap?.dispose();
                material.emissiveMap?.dispose();
                material.envMap?.dispose();
              }
            }
          }
        })
        modelRef.current = null
      }

      if (controlsRef.current) {
        controlsRef.current.dispose()
        controlsRef.current = null
      }
      if (rendererRef.current) {
        if (currentMount && rendererRef.current.domElement) {
          if (currentMount.contains(rendererRef.current.domElement)) {
            currentMount.removeChild(rendererRef.current.domElement)
          }
        }
        rendererRef.current.dispose()
        rendererRef.current = null
      }
      sceneRef.current = null
      cameraRef.current = null
    }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="
                flex flex-col md:flex-row
                items-center
                justify-center md:justify-between
                md:px-[5%]
                bg-[#09090B00]
                text-zinc-200
                font-assistant
                overflow-hidden
                box-border
                text-center md:text-left
                min-h-[500px]
                md:py-4
            "
      >
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          layout
          className="
                        flex-1
                        max-w-[100%] md:max-w-[50%]
                        md:pr-[50px]
                        z-10
                        order-1 md:order-none
                        mb-0 bg-gray-50/10 dark:bg-black/20 backdrop-blur-[2px] p-2 md:p-8 rounded-lg shadow-lg
                    "
        >
          <m.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            layout
            className="
                            text-4xl md:text-5xl lg:text-[3.5rem]
                            font-bold
                            mb-4
                            leading-tight
                            md:text-right
                            text-gray-900  
                            dark:text-white
                        "
          >
            ברוכים הבאים
            <br />ל<span className="text-accent">בְּלוֹג</span>
            <span className="text-destructive">נָבוֹן</span>
          </m.h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            layout
            className="
                            text-lg md:text-lg lg:text-[1.6rem]
                            leading-relaxed
                            text-gray-600 dark:text-gray-200
                            md:text-right
                            
                        "
          >
            <span className="text-accent font-bold">בְּלוֹג</span>
            <span className="text-destructive font-bold">נָבוֹן</span> הוא המקום
            שבו אנו חוגגים רעיונות חכמים, חדשנות טכנולוגית, ובינה מלאכותית. כאן
            תמצאו תובנות על למידת מכונה, יצירתיות דיגיטלית, ואיך רובוטים משנים
            את העולם.
          </m.p>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          layout
          ref={mountRef}
          className="
                        flex-1
                        flex
                        justify-center
                        items-center
                        w-full max-w-[90%] md:max-w-[50%]
                        h-[400px]
                        -mt-12 sm:-mt-0
                        py-4
                        px-6
                        order-2 md:order-none
                    "
        ></m.div>
      </div>
    </LazyMotion>
  )
}

export default HeroSection
