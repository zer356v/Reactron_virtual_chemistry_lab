import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/* =============================
   Types & Utils
============================= */

type Vec3 = [number, number, number];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isFiniteNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

const isVec3 = (p: unknown): p is Vec3 =>
  Array.isArray(p) && p.length === 3 && p.every(isFiniteNumber);

function mixColorHex(a: string, b: string, t: number) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, clamp(t, 0, 1)).getStyle();
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/* =============================
   LiquidPhysics (UPDATED)
============================= */

interface LiquidPhysicsProps {
  containerShape: "cylinder" | "sphere";
  liquidVolume: number;
  viscosity: number;
  density: number;
  position: Vec3;
  agitation: number;
  color?: string;
  secondaryColor?: string;
  mixingLevel?: number;
  temperature?: number;
}

export const LiquidPhysics: React.FC<LiquidPhysicsProps> = ({
  containerShape,
  liquidVolume,
  viscosity,
  density,
  position,
  agitation,
  color = "#87CEEB",
  secondaryColor = "#87CEEB",
  mixingLevel = 1,
  temperature = 20,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  const vVolume = clamp(liquidVolume, 0.05, 1);
  const vAgitation = clamp(agitation, 0, 1);
  const vViscosity = clamp(viscosity, 0, 1);
  const vTemp = clamp(temperature, -50, 500);

  const vPosition = isVec3(position)
    ? new THREE.Vector3(...position)
    : new THREE.Vector3();

  const liquidColor = useMemo(
    () => mixColorHex(color, secondaryColor, mixingLevel),
    [color, secondaryColor, mixingLevel]
  );

  const geometry = useMemo(() => {
    if (containerShape === "cylinder") {
      return new THREE.CylinderGeometry(
        0.36,
        0.34,
        Math.max(0.1, vVolume),
        48,
        1,
        true
      );
    }
    return new THREE.SphereGeometry(0.22 * Math.cbrt(vVolume), 32, 32);
  }, [containerShape, vVolume]);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(liquidColor),
        transmission: 0.9,
        transparent: true,
        roughness: 0.03 + vViscosity * 0.2,
        metalness: 0,
        ior: 1.33,
        thickness: 0.6 + vVolume * 0.8,
        attenuationColor: new THREE.Color(liquidColor),
        attenuationDistance: 0.5 + vVolume,
        side: THREE.DoubleSide,
      }),
    [liquidColor, vViscosity, vVolume]
  );

  const bubbleCount = Math.min(
    150,
    Math.round(vAgitation * 80 + Math.max(0, (vTemp - 40) * 0.8))
  );

  const [bubblePool] = useState(() =>
    Array.from({ length: bubbleCount }).map(() => ({
      pos: new THREE.Vector3(
        randomBetween(-0.15, 0.15),
        randomBetween(0, vVolume * 0.5),
        randomBetween(-0.15, 0.15)
      ),
      vel: new THREE.Vector3(0, randomBetween(0.001, 0.01), 0),
      scale: randomBetween(0.005, 0.02),
    }))
  );

  useFrame(({ clock }) => {
    timeRef.current = clock.elapsedTime;
    if (!meshRef.current) return;

    // 🔒 Keep liquid level (NO rotation)
    meshRef.current.rotation.set(0, 0, 0);

    const wave =
      Math.sin(timeRef.current * (1 + vAgitation * 3)) *
      (0.005 + vAgitation * 0.01) *
      (1 - vViscosity * 0.6);

    meshRef.current.position.set(
      vPosition.x,
      vPosition.y - 0.5 + vVolume * 0.5 + wave,
      vPosition.z
    );

    if (instancedRef.current) {
      const dummy = new THREE.Object3D();

      bubblePool.forEach((b, i) => {
        b.pos.addScaledVector(b.vel, 1 + vAgitation);
        if (b.pos.y > vVolume * 0.6) b.pos.y = 0;

        dummy.position.copy(b.pos);
        dummy.scale.setScalar(b.scale);
        dummy.updateMatrix();
        instancedRef.current!.setMatrixAt(i, dummy.matrix);
      });

      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={vPosition}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      {bubbleCount > 0 && (
        <instancedMesh
          ref={instancedRef}
          args={[undefined as any, undefined as any, bubbleCount]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshPhongMaterial
            color="#F0F8FF"
            transparent
            opacity={0.8}
            shininess={80}
          />
        </instancedMesh>
      )}
    </group>
  );
};

/* =============================
   TemperatureVisualization
============================= */

interface TemperatureVisualizationProps {
  temperature: number;
  position: Vec3;
  equipmentType?: string;
}

export const TemperatureVisualization: React.FC<
  TemperatureVisualizationProps
> = ({ temperature, position }) => {
  const t = clamp(temperature, -50, 1000);

  const color =
    t < 25 ? "#0088FF" : t < 50 ? "#00FFFF" : t < 75 ? "#FFFF66" : "#FF4444";

  const intensity = clamp((t - 20) / 120, 0, 1);

  return (
    <group position={new THREE.Vector3(...position)}>
      {t > 40 && (
        <mesh>
          <sphereGeometry args={[0.18 + intensity * 0.12, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6 * intensity}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
      {t > 70 && <SteamParticles temperature={t} />}
    </group>
  );
};

/* =============================
   SteamParticles
============================= */

export const SteamParticles: React.FC<{ temperature: number }> = ({
  temperature,
}) => {
  const [particles, setParticles] = useState<
    { id: number; pos: THREE.Vector3; vel: THREE.Vector3; life: number }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            pos: p.pos.add(p.vel),
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
};

/* =============================
   PH Indicator
============================= */

export const PHIndicator: React.FC<{ pH: number; position: Vec3 }> = ({
  pH,
  position,
}) => {
  const color =
    pH < 7 ? "#FF4444" : pH === 7 ? "#00FF00" : "#4444FF";

  return (
    <mesh position={new THREE.Vector3(...position)}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} />
    </mesh>
  );
};

/* =============================
   ReactionProgressBar
============================= */

export const ReactionProgressBar: React.FC<{
  progress: number;
  reactionType?: string;
  position: Vec3;
}> = ({ progress, reactionType = "Reaction", position }) => (
  <Html position={new THREE.Vector3(...position)} center>
    <div className="bg-black/80 text-white p-2 rounded">
      <div className="text-xs font-bold">{reactionType}</div>
      <div className="w-28 h-2 bg-gray-700 mt-1 rounded">
        <div
          className="h-full bg-green-500"
          style={{ width: `${clamp(progress, 0, 1) * 100}%` }}
        />
      </div>
    </div>
  </Html>
);

/* =============================
   EquipmentStateIndicator
============================= */

export const EquipmentStateIndicator: React.FC<{
  isSelected?: boolean;
  isHeated?: boolean;
  hasReaction?: boolean;
  position: Vec3;
}> = ({ isSelected, isHeated, hasReaction, position }) => (
  <group position={new THREE.Vector3(...position)}>
    {isSelected && (
      <mesh>
        <torusGeometry args={[0.18, 0.015, 8, 32]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" />
      </mesh>
    )}
    {isHeated && (
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF2200" />
      </mesh>
    )}
    {hasReaction && (
      <mesh position={[0, 0.35, 0]}>
        <octahedronGeometry args={[0.06]} />
        <meshStandardMaterial color="#FFFF66" emissive="#FFFF66" />
      </mesh>
    )}
  </group>
);
