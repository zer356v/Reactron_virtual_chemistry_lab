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
   CONFIG (ADJUST HERE)
========================= */

// Table
const TABLE_SCALE = 3.5;
const TABLE_OFFSET_Y = -1.2;

// Placeholder (stand)
const SLOT_RADIUS = 0.42;
const SLOT_HEIGHT = 0.02;

// Vertical alignment
const SLOT_Y_OFFSET = 0.015;       // placeholder above table
const EQUIPMENT_Y_OFFSET = 0.18;   // equipment above placeholder

// Right table layout (2 x 10)
const RIGHT_COL_SPACING = 1.8;
const RIGHT_ROW_TOP_Z = -1.4;
const RIGHT_ROW_BOTTOM_Z = -2.6;

// Left table layout (1 x 5)
const LEFT_ROW_SPACING = 0.9;

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
     Load Table Model
  ========================= */

  const table = useGLTF('/models/chemistry-lab-table/source/Table_02.glb');
  useGLTF.preload('/models/chemistry-lab-table/source/Table_02.glb');

  useEffect(() => {
    table.scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [table]);

  /* =========================
     Detect REAL Table Top Y
  ========================= */

  useEffect(() => {
    if (!tableGroupRef.current) return;

    const box = new THREE.Box3().setFromObject(tableGroupRef.current);
    setTableTopY(box.max.y + SLOT_Y_OFFSET);
  }, [table]);

  /* =========================
     Slot Layout
========================= */

  const slots: GridSlot[] = useMemo(() => {
    return [
      /* ---------- RIGHT TABLE (2 x 10) ---------- */
      ...Array.from({ length: 10 }).flatMap((_, i) => {
        const x = -8 + i * RIGHT_COL_SPACING;

        return [
          {
            id: `right-top-${i}`,
            position: [x, tableTopY, RIGHT_ROW_TOP_Z] as [number, number, number],
          },
          {
            id: `right-bottom-${i}`,
            position: [x, tableTopY, RIGHT_ROW_BOTTOM_Z] as [number, number, number],
          },
        ];
      }),

      /* ---------- LEFT TABLE (1 x 5) ---------- */
      ...Array.from({ length: 5 }).map((_, i) => ({
        id: `left-${i}`,
        position: [
          -10.2,
          tableTopY,
          -0.6 + i * LEFT_ROW_SPACING,
        ] as [number, number, number],
      })),
    ];
  }, [tableTopY]);

  /* =========================
     Helpers
  ========================= */

  const isSlotOccupied = (pos: [number, number, number]) =>
    placedEquipment.some(eq =>
      Math.hypot(eq.position[0] - pos[0], eq.position[2] - pos[2]) < 0.6
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
          ? 0.12 + Math.sin(clock.elapsedTime * 4) * 0.04
          : 0;
      }
    });
  });

  /* =========================
     Render
  ========================= */

  return (
    <group ref={tableRootRef}>
      {/* ===== TABLE ===== */}
      <group
        ref={tableGroupRef}
        position={[0, TABLE_OFFSET_Y, 0]}
        rotation={[0, Math.PI, 0]}
        scale={[TABLE_SCALE, TABLE_SCALE, TABLE_SCALE]}
      >
        <primitive object={table.scene} />
      </group>

      {/* ===== PLACEHOLDERS (ONLY WHILE DRAGGING) ===== */}
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
                opacity={0.7}
              />
            </mesh>
          );
        })}
    </group>
  );
};
