import React, { useRef, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useDragDrop } from "./DragDropProvider";
import * as THREE from "three";

/* =========================
   Props
========================= */

interface EnhancedLabTableProps {
  onEquipmentPlace: (
    id: string,
    position: [number, number, number],
    itemData?: any // 🔥 ADD THIS - optional third parameter
  ) => void;
  onEquipmentRemove?: (id: string) => void;
  onEquipmentMove?: (id: string, newPosition: [number, number, number]) => void;
  placedEquipment: {
    id: string;
    position: [number, number, number];
    type: string;
  }[];
}

/* =========================
   CONFIG
========================= */

const SIZE_MULTIPLIER = 2;
const TABLE_SCALE = 3.5 * SIZE_MULTIPLIER;
const TABLE_OFFSET_Y = 2.2;

const HIT_PLANE_OFFSET_Y = 0.02;
const EQUIPMENT_Y_OFFSET = 0.7;
const STACK_Y_OFFSET = 0.35;
const STACK_RADIUS = 0.5;

// 🔥 CAMERA & ZOOM CONFIG
const CAMERA_CONFIG = {
  minDistance: 5,
  maxDistance: 40,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 2 - 0.1,
  enableDamping: true,
  dampingFactor: 0.05,
  panSpeed: 0.8,
  rotateSpeed: 0.6,
  zoomSpeed: 0.8,
};

const MOVE_THRESHOLD = 5;
const DOUBLE_CLICK_DELAY = 300;

/* =========================
   Utils
========================= */

const canStackOn = (bottom: string, top: string) => {
  if (bottom.includes("burner") && top.includes("beaker")) return true;
  if (bottom.includes("burner") && top.includes("flask")) return true;
  if (bottom.includes("beaker") && top.includes("beaker")) return true;
  return false;
};

const stackPosition = (
  base: [number, number, number]
): [number, number, number] => [
  base[0],
  base[1] + STACK_Y_OFFSET,
  base[2],
];

const isInsideTable = (
  position: THREE.Vector3,
  tableBox: THREE.Box3,
  margin: number = 0.4
): boolean => {
  return (
    position.x >= tableBox.min.x + margin &&
    position.x <= tableBox.max.x - margin &&
    position.z >= tableBox.min.z + margin &&
    position.z <= tableBox.max.z - margin
  );
};

/* =========================
   Component
========================= */

export const EnhancedLabTable: React.FC<EnhancedLabTableProps> = ({
  onEquipmentPlace,
  onEquipmentRemove,
  onEquipmentMove,
  placedEquipment,
}) => {
  const tableGroupRef = useRef<THREE.Group>(null);
  const hitPlaneRef = useRef<THREE.Mesh>(null);
  const orbitControlsRef = useRef<any>(null);

  const { camera, raycaster, pointer, gl } = useThree();
  const { draggedItem, isDragging, setDraggedItem, setIsDragging } =
    useDragDrop();

  const [tableBox, setTableBox] = useState<THREE.Box3 | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const [movingEquipmentId, setMovingEquipmentId] = useState<string | null>(null);
  const [isMovingEquipment, setIsMovingEquipment] = useState(false);
  const [rightClickStartPos, setRightClickStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  const [lastRightClickTime, setLastRightClickTime] = useState(0);
  const [lastRightClickEquipmentId, setLastRightClickEquipmentId] = useState<string | null>(null);

  /* =========================
     Load Table
  ========================= */

  const table = useGLTF("/models/studio2.glb");
  useGLTF.preload("/models/studio2.glb");

  useEffect(() => {
    table.scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [table]);

  /* =========================
     Table Bounds
  ========================= */

  useEffect(() => {
    if (!tableGroupRef.current) return;
    setTableBox(new THREE.Box3().setFromObject(tableGroupRef.current));
  }, [table]);

  /* =========================
     🔥 FIND CLICKED EQUIPMENT
  ========================= */

  const findClickedEquipment = (): string | null => {
    if (!tableBox) return null;

    raycaster.setFromCamera(pointer, camera);
    
    if (hitPlaneRef.current) {
      const hits = raycaster.intersectObject(hitPlaneRef.current);
      if (hits.length > 0) {
        const clickPos = hits[0].point;
        
        for (const eq of placedEquipment) {
          const distance = Math.hypot(
            eq.position[0] - clickPos.x,
            eq.position[2] - clickPos.z
          );
          
          if (distance < 0.8) {
            return eq.id;
          }
        }
      }
    }
    
    return null;
  };

  /* =========================
     🔥 LEFT CLICK - Place equipment OR bottles
  ========================= */

  const handlePointerDown = (event: any) => {
    if (!tableBox) return;

    // 🔥 LEFT CLICK: Placing new equipment/bottle from sidebar
    if (event.button === 0 && isDragging && draggedItem && hitPlaneRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(hitPlaneRef.current);
      if (!hits.length) return;

      const p = hits[0].point;

      if (!isInsideTable(p, tableBox)) {
        console.log("❌ Cannot place outside table!");
        return;
      }

      // 🔥 NEW: Check if placing a bottle
     // 🔥 NEW: Check if placing a bottle
    if (draggedItem.type === "chemical-bottle") {
      // Bottles don't stack - just place them
      const finalPos: [number, number, number] = [
        THREE.MathUtils.clamp(p.x, tableBox.min.x + 0.4, tableBox.max.x - 0.4),
        p.y + EQUIPMENT_Y_OFFSET,
        THREE.MathUtils.clamp(p.z, tableBox.min.z + 0.4, tableBox.max.z - 0.4),
      ];

      console.log(`🧪 Placing bottle: ${draggedItem.chemical?.name} at`, finalPos);
      
      // 🔥 FIXED: Pass complete bottle data as third parameter
      onEquipmentPlace(draggedItem.id, finalPos, draggedItem);
      
      setDraggedItem(null);
      setIsDragging(false);
      setHoveredId(null);
      return;
    }

      // 🔥 Original equipment placement logic (beakers, flasks, etc.)
      const target = placedEquipment.find(eq => {
        const d = Math.hypot(eq.position[0] - p.x, eq.position[2] - p.z);
        return d < STACK_RADIUS;
      });

      let finalPos: [number, number, number];

      if (target && canStackOn(target.type, draggedItem.type)) {
        finalPos = stackPosition(target.position);
        console.log(`✅ Stacking ${draggedItem.type} on ${target.type}`);
      } else {
        finalPos = [
          THREE.MathUtils.clamp(p.x, tableBox.min.x + 0.4, tableBox.max.x - 0.4),
          p.y + EQUIPMENT_Y_OFFSET,
          THREE.MathUtils.clamp(p.z, tableBox.min.z + 0.4, tableBox.max.z - 0.4),
        ];
      }

     // 🔥 FIXED: Also pass draggedItem for regular equipment
        onEquipmentPlace(draggedItem.id, finalPos, draggedItem);
        setDraggedItem(null);
        setIsDragging(false);
        setHoveredId(null);
      return;
    }
  };

  /* =========================
     🔥 RIGHT CLICK DOWN - Detect double-click or start move
  ========================= */

  const handleContextMenu = (event: any) => {
    event.preventDefault();

    if (isDragging || isMovingEquipment) return;

    const clickedEquipmentId = findClickedEquipment();
    
    if (clickedEquipmentId) {
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastRightClickTime;

      // 🔥 CHECK FOR DOUBLE RIGHT-CLICK
      if (
        timeSinceLastClick < DOUBLE_CLICK_DELAY &&
        lastRightClickEquipmentId === clickedEquipmentId
      ) {
        // DOUBLE RIGHT-CLICK = DELETE
        console.log(`🗑️ Double right-click - Deleting: ${clickedEquipmentId}`);
        if (onEquipmentRemove) {
          onEquipmentRemove(clickedEquipmentId);
        }
        
        setLastRightClickTime(0);
        setLastRightClickEquipmentId(null);
        return;
      }

      // 🔥 SINGLE RIGHT-CLICK - Prepare for potential move
      setLastRightClickTime(currentTime);
      setLastRightClickEquipmentId(clickedEquipmentId);
      
      setRightClickStartPos({ x: event.clientX, y: event.clientY });
      setMovingEquipmentId(clickedEquipmentId);
      setHasMoved(false);
      
      console.log(`🎯 Right-click on: ${clickedEquipmentId}`);
    }
  };

  /* =========================
     🔥 MOUSE MOVE - Detect if dragging
  ========================= */

  const handlePointerMove = (event: any) => {
    if (!tableBox) return;

    // 🔥 Check if user is dragging equipment
    if (movingEquipmentId && rightClickStartPos && !isMovingEquipment) {
      const dx = event.clientX - rightClickStartPos.x;
      const dy = event.clientY - rightClickStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > MOVE_THRESHOLD) {
        setIsMovingEquipment(true);
        setHasMoved(true);
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }
        
        console.log(`🚚 Started moving: ${movingEquipmentId}`);
      }
    }

    // 🔥 Move equipment if in moving mode
    if (isMovingEquipment && movingEquipmentId && hitPlaneRef.current && onEquipmentMove) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(hitPlaneRef.current);
      if (!hits.length) return;

      const p = hits[0].point;

      if (isInsideTable(p, tableBox)) {
        const newPos: [number, number, number] = [
          THREE.MathUtils.clamp(p.x, tableBox.min.x + 0.4, tableBox.max.x - 0.4),
          EQUIPMENT_Y_OFFSET + tableBox.max.y,
          THREE.MathUtils.clamp(p.z, tableBox.min.z + 0.4, tableBox.max.z - 0.4),
        ];
        onEquipmentMove(movingEquipmentId, newPos);
      }
      return;
    }

    // 🔥 Preview for new equipment placement (from sidebar)
    if (isDragging && draggedItem && hitPlaneRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(hitPlaneRef.current);
      if (!hits.length) return;

      const p = hits[0].point;

      if (!isInsideTable(p, tableBox)) {
        setHoveredId(null);
        return;
      }

      // 🔥 Bottles don't stack - skip stacking logic for bottles
      if (draggedItem.type === "chemical-bottle") {
        setHoveredId(null);
        return;
      }

      const target = placedEquipment.find(eq => {
        const d = Math.hypot(eq.position[0] - p.x, eq.position[2] - p.z);
        return d < STACK_RADIUS;
      });

      if (target && canStackOn(target.type, draggedItem.type)) {
        setHoveredId(target.id);
      } else {
        setHoveredId(null);
      }
    }
  };

  /* =========================
     🔥 MOUSE UP - Finish move
  ========================= */

  const handlePointerUp = (event: any) => {
    if (event.button === 2) {
      if (isMovingEquipment && movingEquipmentId) {
        console.log(`✅ Placed equipment: ${movingEquipmentId}`);
        setIsMovingEquipment(false);
        
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
      }

      setMovingEquipmentId(null);
      setRightClickStartPos(null);
      setHasMoved(false);
    }
  };

  /* =========================
     Setup Event Listeners
  ========================= */

  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [
    isMovingEquipment, 
    movingEquipmentId, 
    placedEquipment, 
    gl, 
    rightClickStartPos,
    hasMoved,
    tableBox,
    onEquipmentMove,
    onEquipmentRemove,
    lastRightClickTime,
    lastRightClickEquipmentId
  ]);

  /* =========================
     Render
  ========================= */

  return (
    <group>
      <OrbitControls
        ref={orbitControlsRef}
        minDistance={CAMERA_CONFIG.minDistance}
        maxDistance={CAMERA_CONFIG.maxDistance}
        minPolarAngle={CAMERA_CONFIG.minPolarAngle}
        maxPolarAngle={CAMERA_CONFIG.maxPolarAngle}
        enableDamping={CAMERA_CONFIG.enableDamping}
        dampingFactor={CAMERA_CONFIG.dampingFactor}
        panSpeed={CAMERA_CONFIG.panSpeed}
        rotateSpeed={CAMERA_CONFIG.rotateSpeed}
        zoomSpeed={CAMERA_CONFIG.zoomSpeed}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        target={[0, TABLE_OFFSET_Y, 0]}
      />

      <group
        ref={tableGroupRef}
        position={[0, TABLE_OFFSET_Y, 0]}
        rotation={[0, Math.PI, 0]}
        scale={[TABLE_SCALE, TABLE_SCALE, TABLE_SCALE]}
      >
        <primitive object={table.scene} />

        {placedEquipment.map(eq => {
          const isBeingMoved = movingEquipmentId === eq.id && isMovingEquipment;
          const isHovered = hoveredId === eq.id;
          
          return (
            <group 
              key={eq.id} 
              position={eq.position} 
              scale={[2, 2, 2]}
            >
              {isBeingMoved && (
                <>
                  <mesh position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 0.02, 32]} />
                    <meshBasicMaterial color="yellow" transparent opacity={0.6} />
                  </mesh>

                  <mesh position={[0, -0.04, 0]}>
                    <ringGeometry args={[0.5, 0.65, 32]} />
                    <meshBasicMaterial 
                      color="orange" 
                      transparent 
                      opacity={0.8}
                      side={THREE.DoubleSide}
                    />
                  </mesh>

                  <mesh position={[0, 0.9, 0]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.03, 24]} />
                    <meshBasicMaterial color="yellow" transparent opacity={0.7} />
                  </mesh>

                  {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
                    <mesh 
                      key={i}
                      position={[
                        Math.cos(angle) * 0.7,
                        0.05,
                        Math.sin(angle) * 0.7
                      ]}
                      rotation={[Math.PI / 2, 0, angle]}
                    >
                      <coneGeometry args={[0.1, 0.2, 8]} />
                      <meshBasicMaterial color="orange" transparent opacity={0.8} />
                    </mesh>
                  ))}

                  <mesh position={[0, 0.45, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.9, 16]} />
                    <meshBasicMaterial color="yellow" transparent opacity={0.5} />
                  </mesh>
                </>
              )}

              {isHovered && !isBeingMoved && (
                <>
                  <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.05, 24]} />
                    <meshBasicMaterial color="lime" transparent opacity={0.35} />
                  </mesh>
                  
                  <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.15, 0.3, 8]} />
                    <meshBasicMaterial color="lime" transparent opacity={0.6} />
                  </mesh>
                </>
              )}
            </group>
          );
        })}
      </group>

      {tableBox && (
        <mesh
          ref={hitPlaneRef}
          position={[
            (tableBox.min.x + tableBox.max.x) / 2,
            tableBox.max.y + HIT_PLANE_OFFSET_Y,
            (tableBox.min.z + tableBox.max.z) / 2,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={handlePointerDown}
          visible={false}
        >
          <planeGeometry
            args={[
              tableBox.max.x - tableBox.min.x,
              tableBox.max.z - tableBox.min.z,
            ]}
          />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};