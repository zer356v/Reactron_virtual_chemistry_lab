import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";

interface ChemicalBottleProps {
  position: [number, number, number];
  chemical: {
    name: string;
    formula: string;
    color: string;
    concentration: number;
  };
  volumeRemaining: number;
  maxVolume: number;
  isSelected: boolean;
  onClick: () => void;
  isPouringInto?: string | null;
  pouringProgress?: number;
}

export const ChemicalBottleModel: React.FC<ChemicalBottleProps> = ({
  position,
  chemical,
  volumeRemaining = 500,
  maxVolume = 500,
  isSelected = false,
  onClick,
  isPouringInto = null,
  pouringProgress = 0,
}) => {
  const bottleRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Group>(null);

  const currentVolume = volumeRemaining || 500;
  const maxVol = maxVolume || 500;
  const fillPercentage = (currentVolume / maxVol) * 100;

  const [tiltAngle, setTiltAngle] = useState(0);

  useEffect(() => {
    if (isPouringInto && pouringProgress > 0) {
      setTiltAngle(Math.PI / 2 * Math.min(pouringProgress * 2, 1));
    } else {
      setTiltAngle(0);
    }
  }, [isPouringInto, pouringProgress]);

  useFrame((state) => {
    if (bottleRef.current) {
      bottleRef.current.rotation.z = THREE.MathUtils.lerp(
        bottleRef.current.rotation.z,
        tiltAngle,
        0.1
      );
    }

    if (liquidRef.current && !isPouringInto) {
      const time = state.clock.elapsedTime;
      liquidRef.current.position.y = Math.sin(time * 0.5) * 0.01;
    }
  });

  return (
    <group
      ref={bottleRef}
      position={position}
      scale={[0.18, 0.18, 0.18]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Main Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.8, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0}
          transmission={0.85}
          thickness={0.2}
          ior={1.5}
          color="#E8F4F8"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shoulder */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 0.3, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          transmission={0.85}
          color="#E8F4F8"
        />
      </mesh>

      {/* Neck */}
      <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.5, 24]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          transmission={0.85}
          color="#E8F4F8"
        />
      </mesh>

      {/* Cap */}
      <mesh castShadow receiveShadow position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 24]} />
        <meshStandardMaterial
          color="#2C3E50"
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Cap Ridges */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 1.6 + i * 0.025, 0]}>
          <torusGeometry args={[0.22, 0.015, 8, 24]} />
          <meshStandardMaterial color="#1A252F" roughness={0.4} />
        </mesh>
      ))}

      {/* Bottom Base */}
      <mesh castShadow receiveShadow position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          transmission={0.8}
          color="#E8F4F8"
        />
      </mesh>

      {/* LIQUID INSIDE BOTTLE */}
      <group ref={liquidRef} position={[0, -0.8, 0]}>
        {currentVolume > 0 && (
          <>
            <mesh position={[0, (fillPercentage / 100) * 0.85, 0]}>
              <cylinderGeometry 
                args={[
                  0.37, 
                  0.37, 
                  (fillPercentage / 100) * 1.7, 
                  32
                ]} 
              />
              <meshPhysicalMaterial
                color={chemical.color}
                transparent
                opacity={0.85}
                roughness={0.2}
                metalness={0.1}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>

            {fillPercentage > 5 && (
              <mesh 
                position={[0, (fillPercentage / 100) * 1.7 - 0.02, 0]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[0.37, 0.37, 0.02, 32]} />
                <meshPhysicalMaterial
                  color={chemical.color}
                  transparent
                  opacity={0.6}
                  roughness={0.0}
                  metalness={0.2}
                  clearcoat={1.0}
                />
              </mesh>
            )}
          </>
        )}
      </group>

      {/* POURING STREAM */}
      {isPouringInto && pouringProgress > 0.2 && currentVolume > 0 && (
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, -2, 0.3]} rotation={[Math.PI / 6, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 4, 16]} />
            <meshPhysicalMaterial
              color={chemical.color}
              transparent
              opacity={0.7}
              roughness={0.1}
              metalness={0.0}
              clearcoat={1.0}
            />
          </mesh>

          {[0, 1, 2, 3, 4].map((i) => (
            <mesh 
              key={i}
              position={[
                Math.sin(i * 0.5) * 0.05,
                -1.5 - i * 0.4,
                0.3 + i * 0.1
              ]}
            >
              <sphereGeometry args={[0.08 - i * 0.01, 16, 16]} />
              <meshPhysicalMaterial
                color={chemical.color}
                transparent
                opacity={0.8 - i * 0.1}
                roughness={0.0}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Label */}
      <mesh position={[0, 0.2, 0.405]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Label border */}
      <mesh position={[0, 0.2, 0.406]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.62, 0.82]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* Chemical color indicator on label */}
      <mesh position={[0, 0.45, 0.407]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color={chemical.color} />
      </mesh>

      {/* SELECTION GLOW (subtle) */}
      {isSelected && (
        <>
          <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial 
              color="#3B82F6" 
              transparent 
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>

          {[0, 1, 2].map((i) => (
            <mesh 
              key={i} 
              position={[0, -0.6 + i * 0.3, 0]}
            >
              <torusGeometry args={[0.45, 0.02, 16, 32]} />
              <meshBasicMaterial 
                color="#60A5FA" 
                transparent 
                opacity={0.3 - i * 0.08}
              />
            </mesh>
          ))}
        </>
      )}

      {/* 🔥 ONLY SHOW POURING STATUS - NO OTHER HTML LABELS */}
      {isPouringInto && (
        <Html position={[0, 2.5, 0]} center>
          <div className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-xl font-bold text-sm">
            Pouring... {Math.round(pouringProgress * 100)}%
          </div>
        </Html>
      )}
    </group>
  );
};