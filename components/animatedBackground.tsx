"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { useFrame, Canvas, useThree } from "@react-three/fiber"
import { useMouse } from "./useMouse"


function NoiseShader() {
    const mesh = useRef<THREE.Mesh>(null!)
    const mouse = useMouse()
    const { viewport } = useThree()

    // Create shader material
    const material = useRef(
        new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_resolution: { value: new THREE.Vector2() },
                u_mouse: { value: new THREE.Vector2() },
            },
            vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        
        // Noise functions from https://gist.github.com/paticiogonzalezvivo/670c22f3966e662d2f83
        float random(vec2 p) {
          return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        #define OCTAVES 6
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 0.0;
          
          for (int i = 0; i < OCTAVES; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          
          return value;
        }
        
        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          st.x *= u_resolution.x / u_resolution.y;
          
          // Mouse interaction
          vec2 mousePos = u_mouse.xy / u_resolution.xy;
          float dist = distance(st, mousePos);
          float influence = smoothstep(0.3, 0.0, dist);
          
          // Animated noise
          vec2 q = vec2(0.0);
          q.x = fbm(st + 0.1 * u_time);
          q.y = fbm(st + vec2(1.0));
          
          vec2 r = vec2(0.0);
          r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
          r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);
          
          // Add mouse influence
          r += influence * 0.2 * vec2(sin(u_time * 0.5), cos(u_time * 0.5));
          
          // Generate color
          float f = fbm(st + r);
          
          vec3 color1 = vec3(0.18, 0.49, 0.20); // Dark emerald-green (#2E7D32)
          vec3 color2 = vec3(0.30, 0.69, 0.31); // Light emerald-green (#4CAF50)
          vec3 color3 = vec3(0.12, 0.12, 0.12); // Dark gray (#1E1E1E)
          
          vec3 color = mix(color1, color2, clamp(f * f * 4.0, 0.0, 1.0));
          color = mix(color, color3, clamp(length(q), 0.0, 1.0));
          
          // Add some static noise
          float staticNoise = random(st * 100.0 + u_time) * 0.03;
          color += staticNoise;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
        }),
    )

    useEffect(() => {
        if (mesh.current) {
            material.current.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)

            const handleResize = () => {
                material.current.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
            }

            window.addEventListener("resize", handleResize)
            return () => window.removeEventListener("resize", handleResize)
        }
    }, [])

    useFrame(({ clock }) => {
        material.current.uniforms.u_time.value = clock.getElapsedTime()

        // Update mouse position in shader
        const x = (mouse.x / window.innerWidth) * 2 - 1
        const y = -(mouse.y / window.innerHeight) * 2 + 1
        material.current.uniforms.u_mouse.value.set(
            (x * 0.5 + 0.5) * window.innerWidth,
            (y * 0.5 + 0.5) * window.innerHeight,
        )
    })

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material.current} attach="material" />
        </mesh>
    )
}

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas>
                <NoiseShader />
            </Canvas>
        </div>
    )
}
