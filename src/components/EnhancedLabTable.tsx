import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDragDrop } from './DragDropProvider';
import * as THREE from 'three';

/* =========================
   Types
========================= */

interface GridSlot {
  id: string;
  position: [number, number, number];
}

/* =========================
   CONFIG
========================= */

// Table scale
const SIZE_MULTIPLIER = 4;
const TABLE_SCALE = 3.5 * SIZE_MULTIPLIER;
const TABLE_OFFSET_Y = -1.2;

// Slots
const SLOTS_PER_ROW = 6;
const SLOT_RADIUS = 0.55;
const SLOT_HEIGHT = 0.02;

// Slot layout (LOCAL SPACE)
const SLOT_START_X = -3.8;     // left edge of table
const SLOT_END_X = 3.8;        // right edge of table
const ROW_Z_OFFSET = 0.55;     // front/back rows

// Vertical offsets
const SLOT_Y_OFFSET = 0.52;
const EQUIPMENT_Y_OFFSET = 0.9;

/* =========================
   Props
========================= */

interface EnhancedLabTableProps {
  onEquipmentPlace: (id: string, position: [number, number, number]) => void;
  placedEquipment: { id: string; position: [number, number, number] }[];
}

/* =========================
   Component
========================= */

export const EnhancedLabTable: React.FC<EnhancedLabTableProps> = ({
  onEquipmentPlace,
  placedEquipment,
}) => {
  const tableRootRef = useRef<THREE.Group>(null);
  const tableGroupRef = useRef<THREE.Group>(null);

  const { draggedItem, isDragging, setDraggedItem, setIsDragging } =
    useDragDrop();

  const [tableTopY, setTableTopY] = useState(0);

  /* =========================
     Load Table
  ========================= */

  const table = useGLTF('/models/studio2.glb');
  useGLTF.preload('/models/studio2.glb');

  useEffect(() => {
    table.scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [table]);

  /* =========================
     Table Top Height
  ========================= */

  useEffect(() => {
    if (!tableGroupRef.current) return;

    const box = new THREE.Box3().setFromObject(tableGroupRef.current);
    setTableTopY(box.max.y + SLOT_Y_OFFSET);
  }, [table]);

  /* =========================
     SLOT LAYOUT (FINAL)
  ========================= */

  const slots: GridSlot[] = useMemo(() => {
    const spacing =
      (SLOT_END_X - SLOT_START_X) / (SLOTS_PER_ROW - 1);

    return Array.from({ length: SLOTS_PER_ROW }).flatMap((_, i) => {
      const x = SLOT_START_X + i * spacing;

      return [
        {
          id: `row1-${i}`,
          position: [x, tableTopY, -ROW_Z_OFFSET],
        },
        {
          id: `row2-${i}`,
          position: [x, tableTopY, ROW_Z_OFFSET],
        },
      ] as GridSlot[];
    });
  }, [tableTopY]);

  /* =========================
     Helpers
  ========================= */

  const isSlotOccupied = (pos: [number, number, number]) =>
    placedEquipment.some(eq =>
      Math.hypot(eq.position[0] - pos[0], eq.position[2] - pos[2]) < 0.9
    );

  const handlePlace = (slot: GridSlot) => {
    if (!draggedItem) return;
    if (isSlotOccupied(slot.position)) return;

    onEquipmentPlace(draggedItem.id, [
      slot.position[0],
      slot.position[1] + EQUIPMENT_Y_OFFSET,
      slot.position[2],
    ]);

    setDraggedItem(null);
    setIsDragging(false);
  };

  /* =========================
     Glow Effect
  ========================= */

  useFrame(({ clock }) => {
    if (!tableRootRef.current) return;

    tableRootRef.current.traverse((obj: any) => {
      if (obj.material?.emissive) {
        obj.material.emissiveIntensity = isDragging
          ? 0.15 + Math.sin(clock.elapsedTime * 4) * 0.05
          : 0;
      }
    });
  });

  /* =========================
     Render
  ========================= */

  return (
    <group ref={tableRootRef}>
      <group
        ref={tableGroupRef}
        position={[0, TABLE_OFFSET_Y, 0]}
        rotation={[0, Math.PI, 0]}
        scale={[TABLE_SCALE, TABLE_SCALE, TABLE_SCALE]}
      >
        <primitive object={table.scene} />

        {/* ===== PLACEHOLDERS ===== */}
        {isDragging &&
          slots.map(slot => {
            const occupied = isSlotOccupied(slot.position);

            return (
              <mesh
                key={slot.id}
                position={slot.position}
                onClick={() => handlePlace(slot)}
              >
                <cylinderGeometry
                  args={[SLOT_RADIUS, SLOT_RADIUS, SLOT_HEIGHT, 24]}
                />
                <meshStandardMaterial
                  color={occupied ? '#ff6b6b' : '#ffffff'}
                  transparent
                  opacity={0.75}
                />
              </mesh>
            );
          })}
      </group>
    </group>
  );
};
