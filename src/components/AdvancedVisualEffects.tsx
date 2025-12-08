import * as THREE from "three";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";

interface LightningProps {
  position?: [number, number, number];
  intensity?: number;
  length?: number;
  branches?: number;
}

export function UltraLightningV2({
  position = [0, 0, 0],
  intensity = 1,
  length = 1.2,
  branches = 3,
}: LightningProps) {
  const mainBoltRef = useRef<THREE.Line | null>(null);
  const glowRef = useRef<THREE.Sprite | null>(null);

  // Geometry + materials created once (important!)
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0x55ffff),
        transparent: true,
        opacity: 0.9 * intensity,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        color: new THREE.Color(0x55ffff),
        transparent: true,
        opacity: 0.6 * intensity,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const heatMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          uniform float intensity;

          void main() {
            float ripple = sin((vUv.x + time * 2.0) * 25.0) * 0.02;
            float alpha = (1.0 - vUv.y) * 0.4 * intensity;
            gl_FragColor = vec4(0.7, 1.0, 1.0, alpha * ripple);
          }
        `,
      }),
    []
  );

  const generateBolt = () => {
    const pts: THREE.Vector3[] = [];
    let p = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < 20; i++) {
      pts.push(p.clone());
      p = p.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          length / 20,
          (Math.random() - 0.5) * 0.3
        )
      );
    }

    return pts;
  };

  const generateBranches = () => {
    const lines: THREE.Line[] = [];

    for (let b = 0; b < branches; b++) {
      const pts: THREE.Vector3[] = [];
      let p = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        0.2,
        (Math.random() - 0.5) * 0.1
      );

      for (let i = 0; i < 10; i++) {
        pts.push(p.clone());
        p = p.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            length / 40,
            (Math.random() - 0.5) * 0.2
          )
        );
      }

      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(0x99ffff),
        transparent: true,
        opacity: 0.5 * intensity,
        blending: THREE.AdditiveBlending,
      });

      lines.push(new THREE.Line(geo, mat));
    }

    return lines;
  };

  const branchLines = useRef<THREE.Line[]>(generateBranches());

  useFrame((state, delta) => {
    // Lightning pulse flicker
    const flicker = 0.6 + Math.random() * 0.4;
    if (mainBoltRef.current) {
      const mat = mainBoltRef.current.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          const lm = m as THREE.LineBasicMaterial;
          lm.opacity = flicker * intensity;
        });
      } else {
        (mat as THREE.LineBasicMaterial).opacity = flicker * intensity;
      }
    }

    // Update heat distortion
    heatMaterial.uniforms.time.value += delta;

    // Regenerate bolt for animated movement
    const pts = generateBolt();
    geometry.setFromPoints(pts);

    // Update branches
    branchLines.current.forEach((branch) => {
      const branchPts = generateBolt().slice(0, 8);
      branch.geometry.setFromPoints(branchPts);
      branch.visible = Math.random() > 0.4;
    });

    // Glow pulsation
    if (glowRef.current) {
      const s = 0.6 + Math.sin(state.clock.elapsedTime * 40) * 0.2;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* Main bolt */}
      <primitive ref={mainBoltRef} object={new THREE.Line(geometry, material)} />

      {/* Branch sub-bolts */}
      {branchLines.current.map((branch, i) => (
        <primitive key={i} object={branch} />
      ))}

      {/* Glow aura */}
      <sprite ref={glowRef} material={glowMaterial} scale={[0.8, 0.8, 0.8]} />

      {/* Heat distortion plane */}
      <mesh position={[0, length * 0.5, 0]}>
        <planeGeometry args={[0.5, length]} />
        <primitive object={heatMaterial} attach="material" />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------
   GPU PARTICLES (Volumetric, Smooth Fade, Additive Blend)
--------------------------------------------------------- */
interface GPUProps {
  count?: number;
  size?: number;
  color?: string;
  speed?: number;
  spread?: number;
  lifetime?: number;
  position?: [number, number, number];
}

export function GPUParticles({
  count = 300,
  size = 0.04,
  color = "#ffffff",
  speed = 1,
  spread = 0.25,
  lifetime = 2,
  position = [0, 0, 0],
}: GPUProps) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  const lifetimes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random() * lifetime;
    return arr;
  }, [count, lifetime]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const pos = meshRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      lifetimes[i] -= delta;

      // Respawn if dead
      if (lifetimes[i] <= 0) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
        lifetimes[i] = lifetime;
      }

      pos[i * 3 + 1] += delta * speed;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------------------------------------------------
   VOLUMETRIC SMOKE (Soft Noise Shader)
--------------------------------------------------------- */
interface EffectProps {
  position?: [number, number, number];
  intensity?: number;
}

export function VolumetricSmoke({
  position = [0, 0, 0],
  intensity = 1,
}: EffectProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
        },
        vertexShader: `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          uniform float intensity;

          float noise(vec2 p){
            return fract(sin(dot(p, vec2(12.989, 78.233))) * 43758.5453);
          }

          void main(){
            float n = noise(vUv * 4.0 + time * 0.1);
            float fade = smoothstep(0.3, 0.9, n);
            gl_FragColor = vec4(vec3(0.9), fade * intensity);
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    material.uniforms.time.value += delta;
  });

  return (
    <mesh position={position}>
      <planeGeometry args={[1.2, 1.2]} />
      <primitive object={material} />
    </mesh>
  );
}

/* ---------------------------------------------------------
   FIRE + HOT SPARKS
--------------------------------------------------------- */
export function FireEffect({
  position = [0, 0, 0],
  intensity = 1,
}: EffectProps) {
  const flame = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!flame.current) return;

    flame.current.scale.y = 1 + Math.sin(t * 10) * 0.3 * intensity;
    flame.current.scale.x = 1 + Math.sin(t * 8) * 0.15 * intensity;

    const mat = flame.current.material;
    if (!Array.isArray(mat)) {
      (mat as THREE.MeshBasicMaterial).opacity =
        0.7 + Math.sin(t * 12) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={flame} position={[0, 0.25, 0]}>
        <coneGeometry args={[0.12, 0.45, 16]} />
        <meshBasicMaterial
          color="#ff5500"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <GPUParticles
        position={[0, 0.4, 0]}
        color="#ffaa33"
        size={0.03}
        speed={1.5}
        spread={0.2}
        count={80}
      />
    </group>
  );
}

/* ---------------------------------------------------------
   ELECTRIC ARC / LIGHTNING
--------------------------------------------------------- */
export function ElectricArc({
  position = [0, 0, 0] as [number, number, number],
  intensity = 1,
}) {
  const arcRef = useRef<THREE.Line | null>(null);

  const geometry = useRef(new THREE.BufferGeometry()).current;
  const material = useRef(
    new THREE.LineBasicMaterial({
      color: "#00ffff",
      transparent: true,
      opacity: intensity,
      blending: THREE.AdditiveBlending,
    })
  ).current;

  useFrame(() => {
    if (!arcRef.current) return;

    const pts: THREE.Vector3[] = [];
    let p = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < 12; i++) {
      pts.push(p.clone());
      p = p.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          Math.random() * 0.15,
          (Math.random() - 0.5) * 0.3
        )
      );
    }

    geometry.setFromPoints(pts);

    // Flicker
    arcRef.current.visible = Math.random() > 0.6;
  });

  return (
    <primitive
      object={new THREE.Line(geometry, material)}
      ref={arcRef}
      position={position}
    />
  );
}

/* ---------------------------------------------------------
   CRYSTAL GROWTH (Animated, Refractive)
--------------------------------------------------------- */
export function CrystalGrowth({
  position = [0, 0, 0],
  intensity = 1,
}: EffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);

  useFrame((_, delta) => {
    const next = Math.min(scale + delta * intensity * 0.4, 1);
    setScale(next);
    if (meshRef.current) meshRef.current.scale.set(next, next, next);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.25]} />
      <meshPhysicalMaterial
        color="#88e0ff"
        roughness={0.05}
        metalness={0.1}
        transmission={1}
        thickness={1}
      />
    </mesh>
  );
}

/* ---------------------------------------------------------
   PRECIPITATION (rain + crystals)
--------------------------------------------------------- */
export function Precipitation({
  position = [0, 0, 0],
  intensity = 1,
}: EffectProps) {
  return (
    <group position={position}>
      <GPUParticles
        count={250}
        speed={-1}
        size={0.02}
        spread={0.5}
        color="#4477ff"
      />

      <CrystalGrowth position={[0, 0, 0]} intensity={intensity * 0.7} />
    </group>
  );
}
